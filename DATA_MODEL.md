# Data Model

Repository represents GitHub/repository metadata only. Personal user data lives in separate models.

```ts
type RepositoryStatus =
  | "want_to_try"
  | "testing"
  | "installed"
  | "favorite"
  | "abandoned"

type Repository = {
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

type RepositoryNote = {
  id: string
  repositoryId: number
  body: string
  createdAt: string
  updatedAt: string
}

type RepositoryMemory = {
  repositoryId: number
  whySaved: string
  nextAction: string
  updatedAt: string
}

type RepositoryRevisit = {
  id: string
  repositoryId: number
  visitedAt: string
}

type RepositorySignal = {
  repositoryId: number
  starredAt: string
  lastVisitedAt: string | null
}

type Collection = {
  id: string
  name: string
  description: string
  color: string
}

type RepositoryCollection = {
  repositoryId: number
  collectionId: string
}

type UserPreferences = {
  theme: "dark" | "light"
  githubUsername: string
}
```
