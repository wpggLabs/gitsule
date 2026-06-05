import type { RepositoryStatus } from "./status"

export type Repository = {
  id: number
  githubId: number
  name: string
  owner: string
  fullName: string
  description: string
  language: string
  stars: number
  forks: number
  topics: string[]
  license: string | null
  homepage: string | null
  githubUrl: string
  lastUpdated: string
  status: RepositoryStatus
}

export type RepositorySignal = {
  repositoryId: number
  starredAt: string
  lastVisitedAt: string | null
}

export type RepositoryNote = {
  id: string
  repositoryId: number
  body: string
  createdAt: string
  updatedAt: string
}
