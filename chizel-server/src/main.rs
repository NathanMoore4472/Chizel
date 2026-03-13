use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::post,
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{Column, Row, TypeInfo};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

// ─── URL resolution ───────────────────────────────────────────────────────────

/// Normalises a SQLite connection URL with a relative path against the process CWD.
/// `sqlite://./assets/dev.db` → `sqlite:///abs/path/to/assets/dev.db`
fn resolve_connection_url(url: &str) -> String {
    if !url.starts_with("sqlite://") {
        return url.to_string();
    }
    let path_part = &url["sqlite://".len()..];
    if !path_part.starts_with('.') {
        return url.to_string();
    }
    let Ok(cwd) = std::env::current_dir() else {
        return url.to_string();
    };
    let abs = cwd.join(path_part);
    // abs already starts with / on Unix, so sqlite:// + /path = sqlite:///path (correct)
    format!("sqlite://{}", abs.display())
}

// ─── Pool cache ───────────────────────────────────────────────────────────────

enum Pool {
    Sqlite(sqlx::SqlitePool),
    Postgres(sqlx::PgPool),
}

type DbPools = Arc<Mutex<HashMap<String, Pool>>>;

// ─── Row → JSON helpers ───────────────────────────────────────────────────────

fn sqlite_row_to_json(row: &sqlx::sqlite::SqliteRow) -> serde_json::Map<String, Value> {
    let mut map = serde_json::Map::new();
    for (i, col) in row.columns().iter().enumerate() {
        let type_name = col.type_info().name().to_uppercase();
        let val = match type_name.as_str() {
            "INTEGER" | "INT" | "BIGINT" | "SMALLINT" | "TINYINT" => {
                row.try_get::<i64, _>(i).map(|v| serde_json::json!(v)).unwrap_or(Value::Null)
            }
            "REAL" | "FLOAT" | "DOUBLE" | "NUMERIC" | "DECIMAL" => {
                row.try_get::<f64, _>(i).map(|v| serde_json::json!(v)).unwrap_or(Value::Null)
            }
            "BOOLEAN" | "BOOL" => {
                row.try_get::<bool, _>(i).map(|v| serde_json::json!(v)).unwrap_or(Value::Null)
            }
            _ => {
                row.try_get::<String, _>(i).map(|v| serde_json::json!(v)).unwrap_or(Value::Null)
            }
        };
        map.insert(col.name().to_string(), val);
    }
    map
}

fn pg_row_to_json(row: &sqlx::postgres::PgRow) -> serde_json::Map<String, Value> {
    let mut map = serde_json::Map::new();
    for (i, col) in row.columns().iter().enumerate() {
        let type_name = col.type_info().name().to_uppercase();
        let val = match type_name.as_str() {
            "INT2" | "INT4" | "INT8" => {
                row.try_get::<i64, _>(i).map(|v| serde_json::json!(v)).unwrap_or(Value::Null)
            }
            "FLOAT4" | "FLOAT8" | "NUMERIC" => {
                row.try_get::<f64, _>(i).map(|v| serde_json::json!(v)).unwrap_or(Value::Null)
            }
            "BOOL" => {
                row.try_get::<bool, _>(i).map(|v| serde_json::json!(v)).unwrap_or(Value::Null)
            }
            _ => {
                row.try_get::<String, _>(i).map(|v| serde_json::json!(v)).unwrap_or(Value::Null)
            }
        };
        map.insert(col.name().to_string(), val);
    }
    map
}

// ─── Request / response types ─────────────────────────────────────────────────

#[derive(Deserialize)]
struct QueryRequest {
    connection_url: String,
    query: String,
}

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

type QueryResult = Result<Json<Vec<serde_json::Map<String, Value>>>, (StatusCode, Json<ErrorBody>)>;

fn err(msg: impl Into<String>) -> (StatusCode, Json<ErrorBody>) {
    (StatusCode::BAD_REQUEST, Json(ErrorBody { error: msg.into() }))
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async fn query(
    State(pools): State<DbPools>,
    Json(req): Json<QueryRequest>,
) -> QueryResult {
    let mut guard = pools.lock().await;
    let url = resolve_connection_url(&req.connection_url);
    println!("[chizel-server] query: raw={:?} resolved={:?}", req.connection_url, url);

    if url.starts_with("sqlite") {
        let pool = match guard.get(&url) {
            Some(Pool::Sqlite(p)) => p.clone(),
            _ => {
                let p = sqlx::SqlitePool::connect(&url).await
                    .map_err(|e| err(format!("Connection failed: {e}")))?;
                guard.insert(url.clone(), Pool::Sqlite(p.clone()));
                p
            }
        };
        let rows = sqlx::query(&req.query).fetch_all(&pool).await
            .map_err(|e| err(format!("Query failed: {e}")))?;
        Ok(Json(rows.iter().map(sqlite_row_to_json).collect()))
    } else {
        let pool = match guard.get(&url) {
            Some(Pool::Postgres(p)) => p.clone(),
            _ => {
                let p = sqlx::PgPool::connect(&url).await
                    .map_err(|e| err(format!("Connection failed: {e}")))?;
                guard.insert(url.clone(), Pool::Postgres(p.clone()));
                p
            }
        };
        let rows = sqlx::query(&req.query).fetch_all(&pool).await
            .map_err(|e| err(format!("Query failed: {e}")))?;
        Ok(Json(rows.iter().map(pg_row_to_json).collect()))
    }
}

async fn test_connection(
    Json(req): Json<QueryRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorBody>)> {
    let url = resolve_connection_url(&req.connection_url);
    if url.starts_with("sqlite") {
        sqlx::SqlitePool::connect(&url).await
            .map_err(|e| err(format!("Connection failed: {e}")))?;
    } else {
        sqlx::PgPool::connect(&url).await
            .map_err(|e| err(format!("Connection failed: {e}")))?;
    }
    Ok(Json(serde_json::json!({ "ok": true })))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(7878);

    let pools: DbPools = Arc::new(Mutex::new(HashMap::new()));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/query", post(query))
        .route("/test", post(test_connection))
        .layer(cors)
        .with_state(pools);

    let addr = format!("127.0.0.1:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await
        .expect("Failed to bind port");

    println!("chizel-server running on http://{addr}");
    axum::serve(listener, app).await.unwrap();
}
