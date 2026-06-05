export const repositoryStatuses = [
  "want_to_try",
  "testing",
  "installed",
  "favorite",
  "abandoned"
] as const

export type RepositoryStatus = (typeof repositoryStatuses)[number]

export const repositoryStatus = {
  wantToTry: "want_to_try",
  testing: "testing",
  installed: "installed",
  favorite: "favorite",
  abandoned: "abandoned"
} as const satisfies Record<string, RepositoryStatus>

export const statusLabels: Record<RepositoryStatus, string> = {
  want_to_try: "Want To Try",
  testing: "Testing",
  installed: "Installed",
  favorite: "Favorite",
  abandoned: "Abandoned"
}
