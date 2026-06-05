import type { Repository } from "../types/repository"
import type { RepositoryStatus } from "../types/status"

export function filterRepositories(
  repositories: Repository[],
  query: string,
  status: RepositoryStatus | "all"
) {
  const normalizedQuery = query.trim().toLowerCase()

  return repositories.filter((repository) => {
    const matchesStatus = status === "all" || repository.status === status
    const haystack = [
      repository.name ?? "",
      repository.owner ?? "",
      repository.fullName ?? "",
      repository.description ?? "",
      repository.language ?? "",
      Array.isArray(repository.topics) ? repository.topics.join(" ") : ""
    ]
      .join(" ")
      .toLowerCase()

    return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery))
  })
}
