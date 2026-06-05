use reqwest::blocking::Client;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const SCHEMA: &str = include_str!("../../src/data/db/schema.sql");

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Repository {
    id: i64,
    github_id: i64,
    name: String,
    owner: String,
    full_name: String,
    description: String,
    language: String,
    stars: i64,
    forks: i64,
    topics: Vec<String>,
    license: Option<String>,
    homepage: Option<String>,
    github_url: String,
    last_updated: String,
    status: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    id: String,
    name: String,
    description: String,
    color: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RepositoryCollection {
    repository_id: i64,
    collection_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RepositoryNote {
    id: String,
    repository_id: i64,
    body: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RepositorySignal {
    repository_id: i64,
    starred_at: String,
    last_visited_at: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPreferences {
    theme: String,
    github_username: String,
    github_token: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StoreSnapshot {
    repositories: Vec<Repository>,
    collections: Vec<Collection>,
    repository_collections: Vec<RepositoryCollection>,
    repository_notes: Vec<RepositoryNote>,
    repository_signals: Vec<RepositorySignal>,
    user_preferences: UserPreferences,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    imported: usize,
    refreshed: usize,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionAssignment {
    pub repository_id: i64,
    pub collection_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteUpdate {
    pub repository_id: i64,
    pub body: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusUpdate {
    pub repository_id: i64,
    pub status: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingUpdate {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StarredImportRequest {
    pub token: String,
}

#[tauri::command]
pub fn get_repository_store_snapshot(app: AppHandle) -> Result<StoreSnapshot, String> {
    let connection = open_database(&app)?;
    read_snapshot(&connection)
}

#[tauri::command]
pub fn seed_repository_store_snapshot(app: AppHandle, snapshot: StoreSnapshot) -> Result<(), String> {
    let mut connection = open_database(&app)?;
    seed_snapshot(&mut connection, snapshot)
}

#[tauri::command]
pub fn reset_dev_database(app: AppHandle) -> Result<(), String> {
    let mut connection = open_database(&app)?;
    clear_database(&mut connection)
}

#[tauri::command]
pub fn import_starred_repositories(
    app: AppHandle,
    request: StarredImportRequest,
) -> Result<ImportResult, String> {
    let token = request.token.trim().to_string();
    if token.is_empty() {
        return Err("GitHub token is required.".to_string());
    }

    let mut connection = open_database(&app)?;
    save_setting(&connection, "githubToken", &token)?;
    let repositories = fetch_starred_repositories(&token)?;
    import_repositories(&mut connection, repositories)
}

#[tauri::command]
pub fn save_repository_note(app: AppHandle, update: NoteUpdate) -> Result<(), String> {
    let connection = open_database(&app)?;
    let now = current_timestamp();
    connection
        .execute(
            "INSERT INTO repository_notes (id, repository_id, body, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?4)
             ON CONFLICT(repository_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at",
            params![format!("note-{}", update.repository_id), update.repository_id, update.body, now],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_repository_status(app: AppHandle, update: StatusUpdate) -> Result<(), String> {
    let connection = open_database(&app)?;
    let now = current_timestamp();
    connection
        .execute(
            "INSERT INTO repository_status (repository_id, status, updated_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(repository_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at",
            params![update.repository_id, update.status, now],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_repository_collection(
    app: AppHandle,
    assignment: CollectionAssignment,
) -> Result<(), String> {
    let connection = open_database(&app)?;
    connection
        .execute(
            "INSERT OR IGNORE INTO repository_collections (repository_id, collection_id, created_at)
             VALUES (?1, ?2, ?3)",
            params![assignment.repository_id, assignment.collection_id, current_timestamp()],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_user_preference(app: AppHandle, update: SettingUpdate) -> Result<(), String> {
    let connection = open_database(&app)?;
    save_setting(&connection, &update.key, &update.value)
}

fn open_database(app: &AppHandle) -> Result<Connection, String> {
    let db_path = database_path(app)?;
    let connection = Connection::open(db_path).map_err(|error| error.to_string())?;
    connection.execute_batch(SCHEMA).map_err(|error| error.to_string())?;
    Ok(connection)
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
    fs::create_dir_all(&app_dir).map_err(|error| error.to_string())?;
    Ok(app_dir.join("gitsule.sqlite3"))
}

fn read_snapshot(connection: &Connection) -> Result<StoreSnapshot, String> {
    Ok(StoreSnapshot {
        repositories: read_repositories(connection)?,
        collections: read_collections(connection)?,
        repository_collections: read_repository_collections(connection)?,
        repository_notes: read_repository_notes(connection)?,
        repository_signals: read_repository_signals(connection)?,
        user_preferences: read_user_preferences(connection)?,
    })
}

fn seed_snapshot(connection: &mut Connection, snapshot: StoreSnapshot) -> Result<(), String> {
    let tx = connection.transaction().map_err(|error| error.to_string())?;
    let now = current_timestamp();

    for repository in snapshot.repositories {
        let topics_json = serde_json::to_string(&repository.topics).map_err(|error| error.to_string())?;
        tx.execute(
            "INSERT INTO repositories (
               id, github_id, owner, name, full_name, description, language, stars, forks,
               topics_json, license, homepage, github_url, last_updated, imported_at, refreshed_at
             )
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?15)
             ON CONFLICT(id) DO UPDATE SET
               github_id = excluded.github_id,
               owner = excluded.owner,
               name = excluded.name,
               full_name = excluded.full_name,
               description = excluded.description,
               language = excluded.language,
               stars = excluded.stars,
               forks = excluded.forks,
               topics_json = excluded.topics_json,
               license = excluded.license,
               homepage = excluded.homepage,
               github_url = excluded.github_url,
               last_updated = excluded.last_updated,
               refreshed_at = excluded.refreshed_at",
            params![
                repository.id,
                repository.github_id,
                repository.owner,
                repository.name,
                repository.full_name,
                repository.description,
                repository.language,
                repository.stars,
                repository.forks,
                topics_json,
                repository.license,
                repository.homepage,
                repository.github_url,
                repository.last_updated,
                now
            ],
        )
        .map_err(|error| error.to_string())?;

        tx.execute(
            "INSERT INTO repository_status (repository_id, status, updated_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(repository_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at",
            params![repository.id, repository.status, now],
        )
        .map_err(|error| error.to_string())?;
    }

    for note in snapshot.repository_notes {
        tx.execute(
            "INSERT INTO repository_notes (id, repository_id, body, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(repository_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at",
            params![note.id, note.repository_id, note.body, note.created_at, note.updated_at],
        )
        .map_err(|error| error.to_string())?;
    }

    for signal in snapshot.repository_signals {
        tx.execute(
            "INSERT INTO repository_signals (repository_id, starred_at, last_visited_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(repository_id) DO UPDATE SET
               starred_at = excluded.starred_at,
               last_visited_at = excluded.last_visited_at",
            params![signal.repository_id, signal.starred_at, signal.last_visited_at],
        )
        .map_err(|error| error.to_string())?;
    }

    for collection in snapshot.collections {
        tx.execute(
            "INSERT INTO collections (id, name, description, color, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?5)
             ON CONFLICT(id) DO UPDATE SET
               name = excluded.name,
               description = excluded.description,
               color = excluded.color,
               updated_at = excluded.updated_at",
            params![collection.id, collection.name, collection.description, collection.color, now],
        )
        .map_err(|error| error.to_string())?;
    }

    for link in snapshot.repository_collections {
        tx.execute(
            "INSERT OR IGNORE INTO repository_collections (repository_id, collection_id, created_at)
             VALUES (?1, ?2, ?3)",
            params![link.repository_id, link.collection_id, now],
        )
        .map_err(|error| error.to_string())?;
    }

    tx.execute(
        "INSERT INTO app_settings (key, value, updated_at)
         VALUES ('theme', ?1, ?4), ('githubUsername', ?2, ?4), ('githubToken', ?3, ?4)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        params![
            snapshot.user_preferences.theme,
            snapshot.user_preferences.github_username,
            snapshot.user_preferences.github_token,
            now
        ],
    )
    .map_err(|error| error.to_string())?;

    tx.commit().map_err(|error| error.to_string())?;
    Ok(())
}

fn clear_database(connection: &mut Connection) -> Result<(), String> {
    let tx = connection.transaction().map_err(|error| error.to_string())?;
    tx.execute("DELETE FROM repository_collections", [])
        .map_err(|error| error.to_string())?;
    tx.execute("DELETE FROM collections", [])
        .map_err(|error| error.to_string())?;
    tx.execute("DELETE FROM repository_signals", [])
        .map_err(|error| error.to_string())?;
    tx.execute("DELETE FROM repository_status", [])
        .map_err(|error| error.to_string())?;
    tx.execute("DELETE FROM repository_notes", [])
        .map_err(|error| error.to_string())?;
    tx.execute("DELETE FROM repositories", [])
        .map_err(|error| error.to_string())?;
    tx.execute("DELETE FROM app_settings", [])
        .map_err(|error| error.to_string())?;
    tx.commit().map_err(|error| error.to_string())?;
    Ok(())
}

fn import_repositories(
    connection: &mut Connection,
    imported_repositories: Vec<ImportedRepository>,
) -> Result<ImportResult, String> {
    let tx = connection.transaction().map_err(|error| error.to_string())?;
    let now = current_timestamp();
    let mut imported = 0;
    let mut refreshed = 0;

    for imported_repository in imported_repositories {
        let exists: bool = tx
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM repositories WHERE github_id = ?1)",
                params![imported_repository.github_id],
                |row| row.get(0),
            )
            .map_err(|error| error.to_string())?;
        let topics_json = serde_json::to_string(&imported_repository.topics).map_err(|error| error.to_string())?;

        tx.execute(
            "INSERT INTO repositories (
               id, github_id, owner, name, full_name, description, language, stars, forks,
               topics_json, license, homepage, github_url, last_updated, imported_at, refreshed_at
             )
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?15)
             ON CONFLICT(github_id) DO UPDATE SET
               owner = excluded.owner,
               name = excluded.name,
               full_name = excluded.full_name,
               description = excluded.description,
               language = excluded.language,
               stars = excluded.stars,
               forks = excluded.forks,
               topics_json = excluded.topics_json,
               license = excluded.license,
               homepage = excluded.homepage,
               github_url = excluded.github_url,
               last_updated = excluded.last_updated,
               refreshed_at = excluded.refreshed_at",
            params![
                imported_repository.github_id,
                imported_repository.github_id,
                imported_repository.owner,
                imported_repository.name,
                imported_repository.full_name,
                imported_repository.description,
                imported_repository.language,
                imported_repository.stars,
                imported_repository.forks,
                topics_json,
                imported_repository.license,
                imported_repository.homepage,
                imported_repository.github_url,
                imported_repository.last_updated,
                now
            ],
        )
        .map_err(|error| error.to_string())?;

        let repository_id: i64 = tx
            .query_row(
                "SELECT id FROM repositories WHERE github_id = ?1",
                params![imported_repository.github_id],
                |row| row.get(0),
            )
            .map_err(|error| error.to_string())?;

        tx.execute(
            "INSERT OR IGNORE INTO repository_status (repository_id, status, updated_at)
             VALUES (?1, 'want_to_try', ?2)",
            params![repository_id, now],
        )
        .map_err(|error| error.to_string())?;

        tx.execute(
            "INSERT INTO repository_signals (repository_id, starred_at, last_visited_at)
             VALUES (?1, ?2, NULL)
             ON CONFLICT(repository_id) DO UPDATE SET starred_at = excluded.starred_at",
            params![repository_id, imported_repository.starred_at],
        )
        .map_err(|error| error.to_string())?;

        if exists {
            refreshed += 1;
        } else {
            imported += 1;
        }
    }

    tx.commit().map_err(|error| error.to_string())?;
    Ok(ImportResult { imported, refreshed })
}

#[derive(Debug)]
struct ImportedRepository {
    github_id: i64,
    owner: String,
    name: String,
    full_name: String,
    description: String,
    language: String,
    stars: i64,
    forks: i64,
    topics: Vec<String>,
    license: Option<String>,
    homepage: Option<String>,
    github_url: String,
    last_updated: String,
    starred_at: String,
}

fn fetch_starred_repositories(token: &str) -> Result<Vec<ImportedRepository>, String> {
    let client = Client::builder().build().map_err(|error| error.to_string())?;
    let mut page = 1;
    let mut repositories = Vec::new();

    loop {
        let response = client
            .get("https://api.github.com/user/starred")
            .query(&[("per_page", "100"), ("page", &page.to_string())])
            .header("User-Agent", "Gitsule")
            .header("Accept", "application/vnd.github.star+json")
            .bearer_auth(token)
            .send()
            .map_err(|error| error.to_string())?;

        if !response.status().is_success() {
            return Err(format!("GitHub import failed with status {}", response.status()));
        }

        let values: Vec<Value> = response.json().map_err(|error| error.to_string())?;
        if values.is_empty() {
            break;
        }

        let page_len = values.len();
        for value in values {
            repositories.push(normalize_starred_repository(value)?);
        }

        if page_len < 100 {
            break;
        }
        page += 1;
    }

    Ok(repositories)
}

fn normalize_starred_repository(value: Value) -> Result<ImportedRepository, String> {
    let starred_at = value
        .get("starred_at")
        .and_then(Value::as_str)
        .map(String::from)
        .unwrap_or_else(current_timestamp);
    let repo = value.get("repo").unwrap_or(&value);
    let owner = repo
        .get("owner")
        .and_then(|owner| owner.get("login"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    Ok(ImportedRepository {
        github_id: repo.get("id").and_then(Value::as_i64).ok_or("Repository id missing")?,
        owner,
        name: string_field(repo, "name"),
        full_name: string_field(repo, "full_name"),
        description: nullable_string_field(repo, "description").unwrap_or_default(),
        language: nullable_string_field(repo, "language").unwrap_or_else(|| "Unknown".to_string()),
        stars: repo.get("stargazers_count").and_then(Value::as_i64).unwrap_or(0),
        forks: repo.get("forks_count").and_then(Value::as_i64).unwrap_or(0),
        topics: repo
            .get("topics")
            .and_then(Value::as_array)
            .map(|topics| topics.iter().filter_map(Value::as_str).map(String::from).collect())
            .unwrap_or_default(),
        license: repo
            .get("license")
            .and_then(|license| license.get("spdx_id"))
            .and_then(Value::as_str)
            .map(String::from),
        homepage: nullable_string_field(repo, "homepage").filter(|homepage| !homepage.is_empty()),
        github_url: string_field(repo, "html_url"),
        last_updated: string_field(repo, "updated_at"),
        starred_at,
    })
}

fn string_field(value: &Value, key: &str) -> String {
    value.get(key).and_then(Value::as_str).unwrap_or("").to_string()
}

fn nullable_string_field(value: &Value, key: &str) -> Option<String> {
    value.get(key).and_then(Value::as_str).map(String::from)
}

fn save_setting(connection: &Connection, key: &str, value: &str) -> Result<(), String> {
    connection
        .execute(
            "INSERT INTO app_settings (key, value, updated_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
            params![key, value, current_timestamp()],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn read_repositories(connection: &Connection) -> Result<Vec<Repository>, String> {
    let mut statement = connection
        .prepare(
            "SELECT r.id, r.github_id, r.name, r.owner, r.full_name, r.description, r.language,
                    r.stars, r.forks, r.topics_json, r.license, r.homepage, r.github_url, r.last_updated,
                    COALESCE(s.status, 'want_to_try') AS status
             FROM repositories r
             LEFT JOIN repository_status s ON s.repository_id = r.id
             ORDER BY r.full_name",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map([], |row| {
            let topics_json: String = row.get(9)?;
            let topics = serde_json::from_str(&topics_json).unwrap_or_default();
            Ok(Repository {
                id: row.get(0)?,
                github_id: row.get(1)?,
                name: row.get(2)?,
                owner: row.get(3)?,
                full_name: row.get(4)?,
                description: row.get(5)?,
                language: row.get(6)?,
                stars: row.get(7)?,
                forks: row.get(8)?,
                topics,
                license: row.get(10)?,
                homepage: row.get(11)?,
                github_url: row.get(12)?,
                last_updated: row.get(13)?,
                status: row.get(14)?,
            })
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
}

fn read_collections(connection: &Connection) -> Result<Vec<Collection>, String> {
    let mut statement = connection
        .prepare("SELECT id, name, description, color FROM collections ORDER BY name")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok(Collection {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                color: row.get(3)?,
            })
        })
        .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
}

fn read_repository_collections(connection: &Connection) -> Result<Vec<RepositoryCollection>, String> {
    let mut statement = connection
        .prepare("SELECT repository_id, collection_id FROM repository_collections")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok(RepositoryCollection {
                repository_id: row.get(0)?,
                collection_id: row.get(1)?,
            })
        })
        .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
}

fn read_repository_notes(connection: &Connection) -> Result<Vec<RepositoryNote>, String> {
    let mut statement = connection
        .prepare("SELECT id, repository_id, body, created_at, updated_at FROM repository_notes")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok(RepositoryNote {
                id: row.get(0)?,
                repository_id: row.get(1)?,
                body: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
}

fn read_repository_signals(connection: &Connection) -> Result<Vec<RepositorySignal>, String> {
    let mut statement = connection
        .prepare("SELECT repository_id, starred_at, last_visited_at FROM repository_signals")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok(RepositorySignal {
                repository_id: row.get(0)?,
                starred_at: row.get(1)?,
                last_visited_at: row.get(2)?,
            })
        })
        .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
}

fn read_user_preferences(connection: &Connection) -> Result<UserPreferences, String> {
    let theme = read_setting(connection, "theme")?.unwrap_or_else(|| "dark".to_string());
    let github_username = read_setting(connection, "githubUsername")?.unwrap_or_default();
    let github_token = read_setting(connection, "githubToken")?.unwrap_or_default();
    Ok(UserPreferences { theme, github_username, github_token })
}

fn read_setting(connection: &Connection, key: &str) -> Result<Option<String>, String> {
    connection
        .query_row("SELECT value FROM app_settings WHERE key = ?1", params![key], |row| row.get(0))
        .optional()
        .map_err(|error| error.to_string())
}

fn current_timestamp() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs().to_string())
        .unwrap_or_else(|_| "0".to_string())
}
