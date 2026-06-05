# Data Model

## Repository

```ts
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

  status:
    | "want_to_try"
    | "testing"
    | "installed"
    | "favorite"
    | "abandoned"

  notes: string
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
