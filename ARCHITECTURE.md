# ARCHITECTURE.md

# Mission

Gitsule is a local-first desktop application for organizing GitHub discoveries.

Core flow:

GitHub Stars
→ Local Import
→ SQLite Library
→ Status / Collections / Notes
→ Rediscovery

# Architecture Principles

- Local-first
- Fast startup
- No required backend
- No cloud sync in V1
- GitHub API only for import/refresh
- SQLite as source of truth
- UI reads from local database, not live GitHub
- Keep installer/launcher features out of V1

# Recommended Stack

Desktop: Tauri
Frontend: React
Language: TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui
Database: SQLite
API: GitHub REST API
State Management: Zustand

# Folder Structure

src/
├── app/
│   ├── routes/
│   └── layout/
│
├── components/
│   ├── repo/
│   ├── collection/
│   ├── status/
│   ├── layout/
│   └── ui/
│
├── data/
│   ├── db/
│   ├── github/
│   ├── repositories/
│   └── collections/
│
├── types/
│   ├── repository.ts
│   ├── collection.ts
│   └── status.ts
│
├── utils/
│   ├── dates.ts
│   ├── filters.ts
│   └── sorting.ts

# Data Flow

User connects GitHub
→ Import starred repositories
→ Normalize GitHub response
→ Store in SQLite
→ Render UI from SQLite

# Database Tables

## repositories

id
github_id
owner
name
full_name
description
language
stars
forks
topics_json
license
homepage
github_url
last_updated
imported_at
refreshed_at

## repository_notes

id
repository_id
body
created_at
updated_at

## repository_status

repository_id
status
updated_at

Allowed status values:

want_to_try
testing
installed
favorite
abandoned

## collections

id
name
description
color
created_at
updated_at

## repository_collections

repository_id
collection_id
created_at

## app_settings

key
value
updated_at

# GitHub Integration

V1:

- OAuth Login
- Import Starred Repositories
- Refresh Repository Metadata

V2:

- Latest Releases
- README Import
- Topic Discovery

# Pages

## Home

Shows:

- Recent Stars
- Recently Updated
- Favorites
- Continue Exploring

## Library

Shows:

- All Repositories
- Search
- Filters
- Sort

## Repository Details

Shows:

- Description
- Metadata
- Notes
- Collections
- Status

## Collections

Shows:

- User Collections
- Repository Counts

## Settings

Shows:

- GitHub Account
- Sync Settings
- Theme

# Explicitly Not V1

- Installers
- Docker Management
- WSL Management
- Launcher System
- Recipe Engine
- AI Summaries
- Social Features
- Reviews
- Profiles
- Marketplace
- Recommendations

# Success Criteria

A successful V1 allows a user to:

1. Connect GitHub
2. Import Stars
3. Organize Repositories
4. Add Notes
5. Create Collections
6. Rediscover Forgotten Projects

If those 6 things work well, V1 is complete.
