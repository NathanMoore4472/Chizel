use std::collections::HashMap;
use tokio::sync::Mutex;
use sqlx::any::AnyPoolOptions;
use sqlx::{Column, Row};

/// Cached connection pools keyed by connection URL
struct DbPools(Mutex<HashMap<String, sqlx::AnyPool>>);

/// Convert a single AnyRow to a JSON object, trying numeric types first
fn row_to_json(row: &sqlx::any::AnyRow) -> serde_json::Map<String, serde_json::Value> {
    let mut map = serde_json::Map::new();
    for (i, col) in row.columns().iter().enumerate() {
        let val: serde_json::Value = if let Ok(v) = row.try_get::<i64, _>(i) {
            serde_json::json!(v)
        } else if let Ok(v) = row.try_get::<f64, _>(i) {
            serde_json::json!(v)
        } else if let Ok(v) = row.try_get::<bool, _>(i) {
            serde_json::json!(v)
        } else if let Ok(v) = row.try_get::<String, _>(i) {
            serde_json::json!(v)
        } else {
            serde_json::Value::Null
        };
        map.insert(col.name().to_string(), val);
    }
    map
}

/// Execute a SQL query and return all rows as a JSON array of objects.
/// connection_url examples:
///   sqlite:///path/to/db.sqlite
///   sqlite://:memory:
///   postgres://user:pass@localhost/mydb
#[tauri::command]
async fn query_database(
    state: tauri::State<'_, DbPools>,
    connection_url: String,
    query: String,
) -> Result<Vec<serde_json::Map<String, serde_json::Value>>, String> {
    let mut pools = state.0.lock().await;

    // Reuse existing pool or create a new one
    let pool = match pools.get(&connection_url) {
        Some(p) => p.clone(),
        None => {
            let p = AnyPoolOptions::new()
                .max_connections(5)
                .connect(&connection_url)
                .await
                .map_err(|e| format!("Connection failed: {}", e))?;
            pools.insert(connection_url.clone(), p.clone());
            p
        }
    };

    let rows = sqlx::query(&query)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    let result = rows.iter().map(|r| row_to_json(r)).collect();
    Ok(result)
}

/// Test a connection without running a query (just connects and disconnects)
#[tauri::command]
async fn test_database_connection(connection_url: String) -> Result<String, String> {
    AnyPoolOptions::new()
        .max_connections(1)
        .connect(&connection_url)
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;
    Ok("Connected successfully".to_string())
}

/// Drop a cached pool (call when the user removes a data source)
#[tauri::command]
async fn close_database_connection(
    state: tauri::State<'_, DbPools>,
    connection_url: String,
) -> Result<(), String> {
    let mut pools = state.0.lock().await;
    pools.remove(&connection_url);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Register sqlx any drivers before building the app
    sqlx::any::install_default_drivers();

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
