import { collections, repositories, repositoryCollections, repositoryNotes, repositorySignals, userPreferences } from "../mock"
import { invoke } from "@tauri-apps/api/core"
import type { Collection } from "../../types/collection"
import type { RepositoryCollection } from "../../types/collection"
import type { Repository, RepositoryNote, RepositorySignal } from "../../types/repository"
import type { RepositoryStatus } from "../../types/status"
import { repositoryStatus, repositoryStatuses } from "../../types/status"
import type { UserPreferences } from "../../types/userPreferences"

export type CollectionSummary = Collection & {
  forgottenCount: number
  needsNotesCount: number
  repoCount: number
  unvisitedCount: number
}

export type RepositoryStoreSnapshot = {
  repositories: Repository[]
  collections: Collection[]
  collectionSummaries: CollectionSummary[]
  collectionCounts: Record<string, number>
  repositoryCollections: RepositoryCollection[]
  repositoryNotes: RepositoryNote[]
  repositorySignals: RepositorySignal[]
  userPreferences: UserPreferences
  settingsMetadata: SettingsMetadata
}

export type RepositoryNoteDrafts = Record<number, string>

export type DashboardData = {
  favorites: Repository[]
  recentlyUpdated: Repository[]
  recentlyStarred: Repository[]
  forgottenRepositories: Repository[]
  importantButStale: Repository[]
  needsNotesRepositories: Repository[]
  savedLongAgoUpdatedRecently: Repository[]
  unvisitedCount: number
  needsNotesCount: number
  testingCount: number
  bestRevisit: Repository | null
  mostSavedCollection: CollectionSummary | null
}

export type StatusFilter = RepositoryStatus | "all"

export type StarredImportResult = {
  imported: number
  refreshed: number
}

export type SettingsMetadata = {
  importedRepositoryCount: number
  lastImportAt: string | null
  databaseSizeBytes: number
}

export function getRepositoryStoreSnapshot(): RepositoryStoreSnapshot {
  return createSnapshot({
    repositories,
    collections,
    repositoryCollections,
    repositoryNotes,
    repositorySignals,
    userPreferences
  })
}

export async function loadRepositoryStoreSnapshot(): Promise<RepositoryStoreSnapshot> {
  if (!isTauriRuntime()) {
    return getRepositoryStoreSnapshot()
  }

  try {
    const snapshot = await invoke<RepositoryStoreSnapshot>("get_repository_store_snapshot")

    if (!snapshot.repositories.length) {
      const seededSnapshot = getRepositoryStoreSnapshot()
      await invoke("seed_repository_store_snapshot", { snapshot: seededSnapshot })
      return seededSnapshot
    }

    return createSnapshot(snapshot)
  } catch {
    return getRepositoryStoreSnapshot()
  }
}

export async function persistRepositoryNote(repositoryId: number, body: string) {
  if (!isTauriRuntime()) {
    return
  }

  try {
    await invoke("save_repository_note", { update: { repositoryId, body } })
  } catch {
    // Browser/dev fallback keeps edits in React state.
  }
}

export async function persistRepositoryStatus(repositoryId: number, status: RepositoryStatus) {
  if (!isTauriRuntime()) {
    return
  }

  try {
    await invoke("save_repository_status", { update: { repositoryId, status } })
  } catch {
    // Browser/dev fallback keeps edits in React state.
  }
}

export async function persistRepositoryCollection(repositoryId: number, collectionId: string) {
  if (!isTauriRuntime()) {
    return
  }

  try {
    await invoke("save_repository_collection", {
      assignment: { repositoryId, collectionId }
    })
  } catch {
    // Collection assignment is not editable in the current UI.
  }
}

export async function persistUserPreference(key: keyof Omit<UserPreferences, "githubTokenStored">, value: string) {
  if (!isTauriRuntime()) {
    return
  }

  try {
    await invoke("save_user_preference", { update: { key, value } })
  } catch {
    // Preferences are not editable in the current UI.
  }
}

export async function importStarredRepositories(
  token: string
): Promise<{ result: StarredImportResult; snapshot: RepositoryStoreSnapshot }> {
  if (!isTauriRuntime()) {
    throw new Error("GitHub import requires the Tauri desktop app.")
  }

  const result = await invoke<StarredImportResult>("import_starred_repositories", { request: { token } })
  return { result, snapshot: await loadRepositoryStoreSnapshot() }
}

export async function seedDevDatabase(): Promise<RepositoryStoreSnapshot> {
  const seededSnapshot = getRepositoryStoreSnapshot()

  if (isTauriRuntime()) {
    try {
      await invoke("seed_repository_store_snapshot", { snapshot: seededSnapshot })
    } catch {
      // Browser/dev fallback returns mock data.
    }
  }

  return seededSnapshot
}

export async function resetDevDatabase(): Promise<RepositoryStoreSnapshot> {
  if (isTauriRuntime()) {
    try {
      await invoke("reset_dev_database")
    } catch {
      // Browser/dev fallback returns mock data.
    }
  }

  return getRepositoryStoreSnapshot()
}

function createSnapshot(data: {
  repositories: Repository[]
  collections: Collection[]
  repositoryCollections: RepositoryCollection[]
  repositoryNotes: RepositoryNote[]
  repositorySignals: RepositorySignal[]
  userPreferences: UserPreferences
  settingsMetadata?: SettingsMetadata
}): RepositoryStoreSnapshot {
  const normalizedCollections = data.collections.map(normalizeCollection)
  const normalizedRepositoryCollections = data.repositoryCollections.map(normalizeRepositoryCollection)
  const normalizedRepositories = data.repositories.map(normalizeRepository)
  const normalizedRepositoryNotes = data.repositoryNotes.map(normalizeRepositoryNote)
  const normalizedRepositorySignals = data.repositorySignals.map(normalizeRepositorySignal)
  const collectionCounts = getCollectionCounts(normalizedRepositoryCollections)

  return {
    repositories: normalizedRepositories,
    collections: normalizedCollections,
    collectionSummaries: normalizedCollections.map((collection) => ({
      ...collection,
      ...getCollectionRediscoveryCounts(
        collection.id,
        normalizedRepositories,
        normalizedRepositoryCollections,
        normalizedRepositoryNotes,
        normalizedRepositorySignals
      ),
      repoCount: collectionCounts[collection.id] ?? 0
    })),
    collectionCounts,
    repositoryCollections: normalizedRepositoryCollections,
    repositoryNotes: normalizedRepositoryNotes,
    repositorySignals: normalizedRepositorySignals,
    userPreferences: data.userPreferences,
    settingsMetadata: data.settingsMetadata ?? {
      importedRepositoryCount: 0,
      lastImportAt: null,
      databaseSizeBytes: 0
    }
  }
}

function normalizeRepository(repository: Repository): Repository {
  return {
    id: Number(repository.id),
    githubId: Number(repository.githubId),
    name: repository.name || "Untitled",
    owner: repository.owner || "unknown",
    fullName: repository.fullName || `${repository.owner || "unknown"}/${repository.name || "untitled"}`,
    description: repository.description || "No description.",
    language: repository.language || "Unknown",
    stars: Number(repository.stars) || 0,
    forks: Number(repository.forks) || 0,
    topics: Array.isArray(repository.topics) ? repository.topics.filter(Boolean) : [],
    license: repository.license || null,
    homepage: repository.homepage || null,
    githubUrl: repository.githubUrl || "",
    lastUpdated: repository.lastUpdated || "",
    status: normalizeRepositoryStatus(repository.status)
  }
}

function normalizeRepositoryStatus(status: unknown): RepositoryStatus {
  return repositoryStatuses.includes(status as RepositoryStatus) ? status as RepositoryStatus : repositoryStatus.wantToTry
}

function normalizeCollection(collection: Collection): Collection {
  return {
    id: collection.id || "uncategorized",
    name: collection.name || "Uncategorized",
    description: collection.description || "",
    color: collection.color || "#2f81f7"
  }
}

function normalizeRepositoryCollection(link: RepositoryCollection): RepositoryCollection {
  return {
    repositoryId: Number(link.repositoryId),
    collectionId: link.collectionId || "uncategorized"
  }
}

function normalizeRepositoryNote(note: RepositoryNote): RepositoryNote {
  return {
    id: note.id || `note-${note.repositoryId}`,
    repositoryId: Number(note.repositoryId),
    body: note.body || "",
    createdAt: note.createdAt || "",
    updatedAt: note.updatedAt || ""
  }
}

function normalizeRepositorySignal(signal: RepositorySignal): RepositorySignal {
  return {
    repositoryId: Number(signal.repositoryId),
    starredAt: signal.starredAt || "",
    lastVisitedAt: signal.lastVisitedAt || null
  }
}

export function getDashboardData(snapshot = getRepositoryStoreSnapshot()): DashboardData {
  const favorites = snapshot.repositories.filter((repository) => repository.status === repositoryStatus.favorite)
  const recentlyUpdated = [...snapshot.repositories]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 3)
  const recentlyStarred = [...snapshot.repositories]
    .sort((a, b) => getRepositorySignal(b, snapshot.repositorySignals).starredAt.localeCompare(getRepositorySignal(a, snapshot.repositorySignals).starredAt))
    .slice(0, 4)
  const forgottenRepositories = [...snapshot.repositories]
    .filter((repository) => {
      const signal = getRepositorySignal(repository, snapshot.repositorySignals)
      return repository.status !== repositoryStatus.abandoned && (!signal.lastVisitedAt || signal.lastVisitedAt < "2026-03-01")
    })
    .sort((a, b) => getRepositorySignal(a, snapshot.repositorySignals).starredAt.localeCompare(getRepositorySignal(b, snapshot.repositorySignals).starredAt))
    .slice(0, 4)
  const needsNotesRepositories = snapshot.repositories
    .filter((repository) => !getRepositoryNote(repository.id, snapshot.repositoryNotes).body.trim())
    .slice(0, 4)
  const needsNotesCount = snapshot.repositories.filter((repository) => !getRepositoryNote(repository.id, snapshot.repositoryNotes).body.trim()).length
  const savedLongAgoUpdatedRecently = [...snapshot.repositories]
    .filter((repository) => {
      const signal = getRepositorySignal(repository, snapshot.repositorySignals)
      return isOlderThanDays(signal.starredAt, 120) && isWithinDays(repository.lastUpdated, 45)
    })
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 4)
  const importantButStale = [...snapshot.repositories]
    .filter((repository) => {
      const signal = getRepositorySignal(repository, snapshot.repositorySignals)
      return (
        (repository.status === repositoryStatus.favorite || repository.status === repositoryStatus.testing) &&
        (!signal.lastVisitedAt || isOlderThanDays(signal.lastVisitedAt, 90))
      )
    })
    .sort((a, b) => getRepositorySignal(a, snapshot.repositorySignals).starredAt.localeCompare(getRepositorySignal(b, snapshot.repositorySignals).starredAt))
    .slice(0, 4)

  return {
    favorites,
    recentlyUpdated,
    recentlyStarred,
    forgottenRepositories,
    importantButStale,
    needsNotesRepositories,
    savedLongAgoUpdatedRecently,
    unvisitedCount: snapshot.repositories.filter((repository) => !getRepositorySignal(repository, snapshot.repositorySignals).lastVisitedAt).length,
    needsNotesCount,
    testingCount: snapshot.repositories.filter((repository) => repository.status === repositoryStatus.testing).length,
    bestRevisit: forgottenRepositories[0] ?? null,
    mostSavedCollection: [...snapshot.collectionSummaries].sort((a, b) => b.forgottenCount - a.forgottenCount)[0] ?? null
  }
}

export function getRepositorySignal(repository: Repository, signals = repositorySignals): RepositorySignal {
  return (
    signals.find((signal) => signal.repositoryId === repository.id) ?? {
      repositoryId: repository.id,
      starredAt: repository.lastUpdated,
      lastVisitedAt: null
    }
  )
}

export function getCollectionsForRepository(
  repositoryId: number,
  links = repositoryCollections,
  availableCollections = collections
): Collection[] {
  return links
    .filter((link) => link.repositoryId === repositoryId)
    .map((link) => availableCollections.find((collection) => collection.id === link.collectionId))
    .filter((collection): collection is Collection => Boolean(collection))
}

export function getRepositoryNote(repositoryId: number, notes = repositoryNotes): RepositoryNote {
  return (
    notes.find((note) => note.repositoryId === repositoryId) ?? {
      id: `note-${repositoryId}`,
      repositoryId,
      body: "",
      createdAt: "",
      updatedAt: ""
    }
  )
}

export function getRepositoryNoteDrafts(notes = repositoryNotes): RepositoryNoteDrafts {
  return Object.fromEntries(notes.map((note) => [note.repositoryId, note.body]))
}

function getCollectionCounts(links = repositoryCollections) {
  return links.reduce<Record<string, number>>((current, link) => {
    current[link.collectionId] = (current[link.collectionId] ?? 0) + 1
    return current
  }, {})
}

function getCollectionRediscoveryCounts(
  collectionId: string,
  availableRepositories: Repository[],
  links: RepositoryCollection[],
  notes: RepositoryNote[],
  signals: RepositorySignal[]
) {
  const repositoryIds = new Set(
    links.filter((link) => link.collectionId === collectionId).map((link) => link.repositoryId)
  )
  const collectionRepositories = availableRepositories.filter((repository) => repositoryIds.has(repository.id))

  return {
    forgottenCount: collectionRepositories.filter((repository) => {
      const signal = getRepositorySignal(repository, signals)
      return repository.status !== repositoryStatus.abandoned && (!signal.lastVisitedAt || isOlderThanDays(signal.lastVisitedAt, 90))
    }).length,
    needsNotesCount: collectionRepositories.filter((repository) => !getRepositoryNote(repository.id, notes).body.trim()).length,
    unvisitedCount: collectionRepositories.filter((repository) => !getRepositorySignal(repository, signals).lastVisitedAt).length
  }
}

function isOlderThanDays(value: string | null, days: number) {
  const timestamp = parseDate(value)
  return timestamp !== null && Date.now() - timestamp > days * 24 * 60 * 60 * 1000
}

function isWithinDays(value: string | null, days: number) {
  const timestamp = parseDate(value)
  return timestamp !== null && Date.now() - timestamp <= days * 24 * 60 * 60 * 1000
}

function parseDate(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}
