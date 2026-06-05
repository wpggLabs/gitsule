import { collections, repositories, repositoryCollections, repositoryNotes, repositorySignals, userPreferences } from "../mock"
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
  const collectionCounts = getCollectionCounts()

  return {
    repositories,
    collections,
    collectionSummaries: collections.map((collection) => ({
      ...collection,
      repoCount: collectionCounts[collection.id] ?? 0
    })),
    collectionCounts,
    repositoryCollections,
    repositoryNotes,
    repositorySignals,
    userPreferences
  }
}

export function getDashboardData(): DashboardData {
  const snapshot = getRepositoryStoreSnapshot()
  const favorites = snapshot.repositories.filter((repository) => repository.status === repositoryStatus.favorite)
  const recentlyUpdated = [...snapshot.repositories]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 3)
  const recentlyStarred = [...snapshot.repositories]
    .sort((a, b) => getRepositorySignal(b).starredAt.localeCompare(getRepositorySignal(a).starredAt))
    .slice(0, 4)
  const forgottenRepositories = [...snapshot.repositories]
    .filter((repository) => {
      const signal = getRepositorySignal(repository)
      return repository.status !== repositoryStatus.abandoned && (!signal.lastVisitedAt || signal.lastVisitedAt < "2026-03-01")
    })
    .sort((a, b) => getRepositorySignal(a).starredAt.localeCompare(getRepositorySignal(b).starredAt))
    .slice(0, 4)

  return {
    favorites,
    recentlyUpdated,
    recentlyStarred,
    forgottenRepositories,
    unvisitedCount: snapshot.repositories.filter((repository) => !getRepositorySignal(repository).lastVisitedAt).length,
    needsNotesCount: snapshot.repositories.filter((repository) => !getRepositoryNote(repository.id).body.trim()).length,
    testingCount: snapshot.repositories.filter((repository) => repository.status === repositoryStatus.testing).length,
    bestRevisit: forgottenRepositories[0] ?? null,
    mostSavedCollection: [...snapshot.collectionSummaries].sort((a, b) => b.repoCount - a.repoCount)[0] ?? null
  }
}

export function getRepositorySignal(repository: Repository): RepositorySignal {
  return (
    repositorySignals.find((signal) => signal.repositoryId === repository.id) ?? {
      repositoryId: repository.id,
      starredAt: repository.lastUpdated,
      lastVisitedAt: null
    }
  )
}

export function getCollectionsForRepository(repositoryId: number): Collection[] {
  return repositoryCollections
    .filter((link) => link.repositoryId === repositoryId)
    .map((link) => collections.find((collection) => collection.id === link.collectionId))
    .filter((collection): collection is Collection => Boolean(collection))
}

export function getRepositoryNote(repositoryId: number): RepositoryNote {
  return (
    repositoryNotes.find((note) => note.repositoryId === repositoryId) ?? {
      id: `note-${repositoryId}`,
      repositoryId,
      body: "",
      createdAt: "",
      updatedAt: ""
    }
  )
}

export function getRepositoryNoteDrafts(): RepositoryNoteDrafts {
  return Object.fromEntries(repositoryNotes.map((note) => [note.repositoryId, note.body]))
}

function getCollectionCounts() {
  return repositoryCollections.reduce<Record<string, number>>((current, link) => {
    current[link.collectionId] = (current[link.collectionId] ?? 0) + 1
    return current
  }, {})
}
