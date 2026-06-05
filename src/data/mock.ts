import type { Collection, RepositoryCollection } from "../types/collection"
import type { Repository, RepositoryNote, RepositorySignal } from "../types/repository"
import type { UserPreferences } from "../types/userPreferences"

export const repositories: Repository[] = [
  {
    id: 1,
    githubId: 70107786,
    name: "tauri",
    owner: "tauri-apps",
    fullName: "tauri-apps/tauri",
    description: "Build smaller, faster, and more secure desktop applications with a web frontend.",
    language: "Rust",
    stars: 89200,
    forks: 2700,
    topics: ["desktop", "rust", "webview"],
    license: "Apache-2.0",
    homepage: "https://tauri.app",
    githubUrl: "https://github.com/tauri-apps/tauri",
    lastUpdated: "2026-05-31",
    status: "testing"
  },
  {
    id: 2,
    githubId: 10270250,
    name: "react",
    owner: "facebook",
    fullName: "facebook/react",
    description: "The library for web and native user interfaces.",
    language: "TypeScript",
    stars: 236000,
    forks: 48000,
    topics: ["ui", "frontend", "components"],
    license: "MIT",
    homepage: "https://react.dev",
    githubUrl: "https://github.com/facebook/react",
    lastUpdated: "2026-05-28",
    status: "installed"
  },
  {
    id: 3,
    githubId: 267872987,
    name: "supabase",
    owner: "supabase",
    fullName: "supabase/supabase",
    description: "The open source Firebase alternative.",
    language: "TypeScript",
    stars: 80600,
    forks: 7900,
    topics: ["database", "auth", "postgres"],
    license: "Apache-2.0",
    homepage: "https://supabase.com",
    githubUrl: "https://github.com/supabase/supabase",
    lastUpdated: "2026-05-25",
    status: "want_to_try"
  },
  {
    id: 4,
    githubId: 33284379,
    name: "pocketbase",
    owner: "pocketbase",
    fullName: "pocketbase/pocketbase",
    description: "Open source backend in one file with realtime database, auth, and admin UI.",
    language: "Go",
    stars: 52200,
    forks: 2400,
    topics: ["backend", "sqlite", "self-hosted"],
    license: "MIT",
    homepage: "https://pocketbase.io",
    githubUrl: "https://github.com/pocketbase/pocketbase",
    lastUpdated: "2026-04-18",
    status: "favorite"
  },
  {
    id: 5,
    githubId: 159408221,
    name: "old-cli-starter",
    owner: "example",
    fullName: "example/old-cli-starter",
    description: "A starter repo that looked useful but has not been updated in years.",
    language: "JavaScript",
    stars: 1200,
    forks: 83,
    topics: ["cli", "starter"],
    license: null,
    homepage: null,
    githubUrl: "https://github.com/example/old-cli-starter",
    lastUpdated: "2023-11-02",
    status: "abandoned"
  },
  {
    id: 6,
    githubId: 184356298,
    name: "lazygit",
    owner: "jesseduffield",
    fullName: "jesseduffield/lazygit",
    description: "Simple terminal UI for git commands.",
    language: "Go",
    stars: 61200,
    forks: 2100,
    topics: ["git", "terminal", "productivity"],
    license: "MIT",
    homepage: null,
    githubUrl: "https://github.com/jesseduffield/lazygit",
    lastUpdated: "2026-05-19",
    status: "want_to_try"
  },
  {
    id: 7,
    githubId: 137724480,
    name: "obsidian-sample-plugin",
    owner: "obsidianmd",
    fullName: "obsidianmd/obsidian-sample-plugin",
    description: "Template for building Obsidian plugins.",
    language: "TypeScript",
    stars: 2900,
    forks: 1600,
    topics: ["notes", "plugins", "knowledge-base"],
    license: "MIT",
    homepage: null,
    githubUrl: "https://github.com/obsidianmd/obsidian-sample-plugin",
    lastUpdated: "2026-03-09",
    status: "testing"
  },
  {
    id: 8,
    githubId: 231554630,
    name: "awesome-selfhosted",
    owner: "awesome-selfhosted",
    fullName: "awesome-selfhosted/awesome-selfhosted",
    description: "A list of free software network services and web applications.",
    language: "Makefile",
    stars: 238000,
    forks: 9800,
    topics: ["awesome-list", "self-hosted", "discovery"],
    license: "CC-BY-SA-3.0",
    homepage: "https://awesome-selfhosted.net",
    githubUrl: "https://github.com/awesome-selfhosted/awesome-selfhosted",
    lastUpdated: "2026-05-06",
    status: "favorite"
  },
  {
    id: 9,
    githubId: 91356712,
    name: "retired-ui-kit",
    owner: "example",
    fullName: "example/retired-ui-kit",
    description: "Old component kit saved during a dashboard redesign.",
    language: "Vue",
    stars: 840,
    forks: 49,
    topics: ["ui", "components"],
    license: null,
    homepage: null,
    githubUrl: "https://github.com/example/retired-ui-kit",
    lastUpdated: "2022-08-14",
    status: "abandoned"
  }
]

export const collections: Collection[] = [
  {
    id: "desktop",
    name: "Desktop Apps",
    description: "Frameworks and examples for local-first tools.",
    color: "#2f81f7"
  },
  {
    id: "frontend",
    name: "Frontend Stack",
    description: "UI libraries, design systems, and app shells.",
    color: "#3fb950"
  },
  {
    id: "self-hosted",
    name: "Self-hosted",
    description: "Projects worth revisiting for local infrastructure.",
    color: "#d29922"
  }
]

export const repositoryCollections: RepositoryCollection[] = [
  { repositoryId: 1, collectionId: "desktop" },
  { repositoryId: 2, collectionId: "frontend" },
  { repositoryId: 3, collectionId: "self-hosted" },
  { repositoryId: 4, collectionId: "self-hosted" },
  { repositoryId: 5, collectionId: "desktop" },
  { repositoryId: 6, collectionId: "desktop" },
  { repositoryId: 7, collectionId: "frontend" },
  { repositoryId: 8, collectionId: "self-hosted" },
  { repositoryId: 9, collectionId: "frontend" }
]

export const repositorySignals: RepositorySignal[] = [
  { repositoryId: 1, starredAt: "2026-05-30", lastVisitedAt: "2026-06-02" },
  { repositoryId: 2, starredAt: "2026-05-24", lastVisitedAt: "2026-06-01" },
  { repositoryId: 3, starredAt: "2026-05-18", lastVisitedAt: null },
  { repositoryId: 4, starredAt: "2025-12-09", lastVisitedAt: "2026-02-10" },
  { repositoryId: 5, starredAt: "2024-03-14", lastVisitedAt: null },
  { repositoryId: 6, starredAt: "2026-06-01", lastVisitedAt: null },
  { repositoryId: 7, starredAt: "2026-04-11", lastVisitedAt: "2026-04-18" },
  { repositoryId: 8, starredAt: "2025-09-28", lastVisitedAt: "2026-01-03" },
  { repositoryId: 9, starredAt: "2023-01-21", lastVisitedAt: null }
]

export const repositoryNotes: RepositoryNote[] = [
  {
    id: "note-1",
    repositoryId: 1,
    body: "Strong candidate for the desktop shell. Verify updater story later.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: "note-2",
    repositoryId: 2,
    body: "Default UI layer. Keep components simple and local.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: "note-3",
    repositoryId: 3,
    body: "Useful reference, not part of Gitsule V1.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: "note-4",
    repositoryId: 4,
    body: "Great example of simple local-first product posture.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: "note-5",
    repositoryId: 5,
    body: "Keep for reference only. Probably not worth testing.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: "note-6",
    repositoryId: 6,
    body: "Worth testing for keyboard-first workflow inspiration.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: "note-7",
    repositoryId: 7,
    body: "Useful reference for personal knowledge workflows.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: "note-8",
    repositoryId: 8,
    body: "Prime rediscovery source. Review monthly.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: "note-9",
    repositoryId: 9,
    body: "",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  }
]

export const userPreferences: UserPreferences = {
  theme: "dark",
  githubUsername: "",
  githubTokenStored: false
}
