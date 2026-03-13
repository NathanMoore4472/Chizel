use std::collections::HashMap;
use tokio::sync::Mutex;
use sqlx::{Column, Row, TypeInfo};

// ─── Row → JSON helpers ──────────────────────────────────────────────────────

fn sqlite_row_to_json(row: &sqlx::sqlite::SqliteRow) -> serde_json::Map<String, serde_json::Value> {
    let mut map = serde_json::Map::new();
    for (i, col) in row.columns().iter().enumerate() {
        let type_name = col.type_info().name().to_uppercase();
        let val = match type_name.as_str() {
            "INTEGER" | "INT" | "BIGINT" | "SMALLINT" | "TINYINT" => {
                row.try_get::<i64, _>(i).map(|v| serde_json::json!(v)).unwrap_or(serde_json::Value::Null)
            }
            "REAL" | "FLOAT" | "DOUBLE" | "NUMERIC" | "DECIMAL" => {
                row.try_get::<f64, _>(i).map(|v| serde_json::json!(v)).unwrap_or(serde_json::Value::Null)
            }
            "BOOLEAN" | "BOOL" => {
                row.try_get::<bool, _>(i).map(|v| serde_json::json!(v)).unwrap_or(serde_json::Value::Null)
            }
            // TEXT, DATETIME, DATE, TIME, BLOB and anything else → String
            _ => {
                row.try_get::<String, _>(i).map(|v| serde_json::json!(v)).unwrap_or(serde_json::Value::Null)
            }
        };
        map.insert(col.name().to_string(), val);
    }
    map
}

fn pg_row_to_json(row: &sqlx::postgres::PgRow) -> serde_json::Map<String, serde_json::Value> {
    let mut map = serde_json::Map::new();
    for (i, col) in row.columns().iter().enumerate() {
        let type_name = col.type_info().name().to_uppercase();
        let val = match type_name.as_str() {
            "INT2" | "INT4" | "INT8" => {
                row.try_get::<i64, _>(i).map(|v| serde_json::json!(v)).unwrap_or(serde_json::Value::Null)
            }
            "FLOAT4" | "FLOAT8" | "NUMERIC" => {
                row.try_get::<f64, _>(i).map(|v| serde_json::json!(v)).unwrap_or(serde_json::Value::Null)
            }
            "BOOL" => {
                row.try_get::<bool, _>(i).map(|v| serde_json::json!(v)).unwrap_or(serde_json::Value::Null)
            }
            _ => {
                row.try_get::<String, _>(i).map(|v| serde_json::json!(v)).unwrap_or(serde_json::Value::Null)
            }
        };
        map.insert(col.name().to_string(), val);
    }
    map
}

// ─── Pool cache (driver-specific to avoid `any` driver type limitations) ─────

enum Pool {
    Sqlite(sqlx::SqlitePool),
    Postgres(sqlx::PgPool),
}

struct DbPools(Mutex<HashMap<String, Pool>>);

// ─── Commands ────────────────────────────────────────────────────────────────

#[tauri::command]
async fn query_database(
    state: tauri::State<'_, DbPools>,
    connection_url: String,
    query: String,
) -> Result<Vec<serde_json::Map<String, serde_json::Value>>, String> {
    let mut pools = state.0.lock().await;

    if connection_url.starts_with("sqlite") {
        let pool = match pools.get(&connection_url) {
            Some(Pool::Sqlite(p)) => p.clone(),
            _ => {
                let p = sqlx::SqlitePool::connect(&connection_url).await
                    .map_err(|e| format!("Connection failed: {}", e))?;
                pools.insert(connection_url.clone(), Pool::Sqlite(p.clone()));
                p
            }
        };
        let rows = sqlx::query(&query).fetch_all(&pool).await
            .map_err(|e| format!("Query failed: {}", e))?;
        Ok(rows.iter().map(sqlite_row_to_json).collect())
    } else {
        let pool = match pools.get(&connection_url) {
            Some(Pool::Postgres(p)) => p.clone(),
            _ => {
                let p = sqlx::PgPool::connect(&connection_url).await
                    .map_err(|e| format!("Connection failed: {}", e))?;
                pools.insert(connection_url.clone(), Pool::Postgres(p.clone()));
                p
            }
        };
        let rows = sqlx::query(&query).fetch_all(&pool).await
            .map_err(|e| format!("Query failed: {}", e))?;
        Ok(rows.iter().map(pg_row_to_json).collect())
    }
}

#[tauri::command]
async fn test_database_connection(connection_url: String) -> Result<String, String> {
    if connection_url.starts_with("sqlite") {
        sqlx::SqlitePool::connect(&connection_url).await
            .map_err(|e| format!("Connection failed: {}", e))?;
    } else {
        sqlx::PgPool::connect(&connection_url).await
            .map_err(|e| format!("Connection failed: {}", e))?;
    }
    Ok("Connected successfully".to_string())
}

#[tauri::command]
async fn close_database_connection(
    state: tauri::State<'_, DbPools>,
    connection_url: String,
) -> Result<(), String> {
    let mut pools = state.0.lock().await;
    pools.remove(&connection_url);
    Ok(())
}

// ─── App entry ───────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(DbPools(Mutex::new(HashMap::new())))
        .invoke_handler(tauri::generate_handler![
            query_database,
            test_database_connection,
            close_database_connection,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
