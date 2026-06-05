import { collections, repositories, repositoryCollections, repositoryNotes, repositorySignals, userPreferences } from "../mock"
import { invoke } from "@tauri-apps/api/core"
import type { Collection } from "../../types/collection"
import type { RepositoryCollection } from "../../types/collection"
import type { Repository, RepositoryNote, RepositorySignal } from "../../types/repository"
import type { RepositoryStatus } from "../../types/status"
import { repositoryStatus } from "../../types/status"
import type { UserPreferences } from "../../types/userPreferences"

export type CollectionSummary = Collection & {
  repoCount: number
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
}

export type RepositoryNoteDrafts = Record<number, string>

export type DashboardData = {
  favorites: Repository[]
  recentlyUpdated: Repository[]
  recentlyStarred: Repository[]
  forgottenRepositories: Repository[]
  unvisitedCount: number
  needsNotesCount: number
  testingCount: number
  bestRevisit: Repository | null
  mostSavedCollection: CollectionSummary | null
}

export type StatusFilter = RepositoryStatus | "all"

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

export async function persistUserPreference(key: keyof UserPreferences, value: string) {
  if (!isTauriRuntime()) {
    return
  }

  try {
    await invoke("save_user_preference", { update: { key, value } })
  } catch {
    // Preferences are not editable in the current UI.
  }
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
}): RepositoryStoreSnapshot {
  const collectionCounts = getCollectionCounts(data.repositoryCollections)

  return {
    repositories: data.repositories,
    collections: data.collections,
    collectionSummaries: data.collections.map((collection) => ({
      ...collection,
      repoCount: collectionCounts[collection.id] ?? 0
    })),
    collectionCounts,
    repositoryCollections: data.repositoryCollections,
    repositoryNotes: data.repositoryNotes,
    repositorySignals: data.repositorySignals,
    userPreferences: data.userPreferences
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

  return {
    favorites,
    recentlyUpdated,
    recentlyStarred,
    forgottenRepositories,
    unvisitedCount: snapshot.repositories.filter((repository) => !getRepositorySignal(repository, snapshot.repositorySignals).lastVisitedAt).length,
    needsNotesCount: snapshot.repositories.filter((repository) => !getRepositoryNote(repository.id, snapshot.repositoryNotes).body.trim()).length,
    testingCount: snapshot.repositories.filter((repository) => repository.status === repositoryStatus.testing).length,
    bestRevisit: forgottenRepositories[0] ?? null,
    mostSavedCollection: [...snapshot.collectionSummaries].sort((a, b) => b.repoCount - a.repoCount)[0] ?? null
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

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}
