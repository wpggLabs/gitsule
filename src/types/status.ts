export type RepositoryStatus =
  | "want_to_try"
  | "testing"
  | "installed"
  | "favorite"
  | "abandoned"

export const statusLabels: Record<RepositoryStatus, string> = {
  want_to_try: "Want To Try",
  testing: "Testing",
  installed: "Installed",
  favorite: "Favorite",
  abandoned: "Abandoned"
}
