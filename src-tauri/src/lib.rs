mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            db::get_repository_store_snapshot,
            db::seed_repository_store_snapshot,
            db::save_repository_note,
            db::save_repository_status,
            db::save_repository_collection,
            db::save_user_preference
        ])
        .run(tauri::generate_context!())
        .expect("error while running Gitsule");
}
