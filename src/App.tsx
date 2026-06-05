import { useEffect, useMemo, useState } from "react"
import { AppShell } from "./components/layout/AppShell"
import { CollectionsView } from "./app/routes/CollectionsView"
import { FavoritesView } from "./app/routes/FavoritesView"
import { HomeView } from "./app/routes/HomeView"
import { LibraryView } from "./app/routes/LibraryView"
import { RepositoryDetailView } from "./app/routes/RepositoryDetailView"
import { SettingsView } from "./app/routes/SettingsView"
import {
  getDashboardData,
  getCollectionsForRepository,
  getRepositoryNoteDrafts,
  getRepositoryStoreSnapshot,
  loadRepositoryStoreSnapshot,
  persistRepositoryNote,
  type StatusFilter
} from "./data/repositories/repositoryStore"
import type { View } from "./types/navigation"
import type { Repository } from "./types/repository"
import { filterRepositories } from "./utils/filters"

function App() {
  const store = useMemo(() => getRepositoryStoreSnapshot(), [])
  const [repositoryStore, setRepositoryStore] = useState(store)
  const dashboard = useMemo(() => getDashboardData(repositoryStore), [repositoryStore])
  const [view, setView] = useState<View>("home")
  const [selectedRepoId, setSelectedRepoId] = useState(repositoryStore.repositories[0].id)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [notesByRepoId, setNotesByRepoId] = useState(() => getRepositoryNoteDrafts(repositoryStore.repositoryNotes))

  useEffect(() => {
    let isMounted = true

    loadRepositoryStoreSnapshot().then((snapshot) => {
      if (!isMounted) {
        return
      }

      setRepositoryStore(snapshot)
      setNotesByRepoId(getRepositoryNoteDrafts(snapshot.repositoryNotes))
      setSelectedRepoId((currentId) => {
        return snapshot.repositories.some((repository) => repository.id === currentId)
          ? currentId
          : snapshot.repositories[0]?.id ?? currentId
      })
    })

    return () => {
      isMounted = false
    }
  }, [])

  const selectedRepo =
    repositoryStore.repositories.find((repository) => repository.id === selectedRepoId) ?? repositoryStore.repositories[0]
  const filteredRepositories = useMemo(
    () => filterRepositories(repositoryStore.repositories, query, statusFilter),
    [repositoryStore.repositories, query, statusFilter]
  )
  const selectedRepoCollections = useMemo(
    () =>
      getCollectionsForRepository(
        selectedRepo.id,
        repositoryStore.repositoryCollections,
        repositoryStore.collections
      ),
    [selectedRepo.id, repositoryStore.repositoryCollections, repositoryStore.collections]
  )

  function openRepository(repository: Repository) {
    setSelectedRepoId(repository.id)
    setView("detail")
  }

  return (
    <AppShell
      activeView={view}
      collectionCount={repositoryStore.collections.length}
      onNavigate={setView}
      repositoryCount={repositoryStore.repositories.length}
    >
      {view === "home" && (
        <HomeView
          collectionSummaries={repositoryStore.collectionSummaries}
          dashboard={dashboard}
          onNavigate={setView}
          onOpenRepository={openRepository}
          repositoryCount={repositoryStore.repositories.length}
        />
      )}

      {view === "library" && (
        <LibraryView
          filteredRepositories={filteredRepositories}
          onOpenRepository={openRepository}
          query={query}
          selectedRepoId={selectedRepoId}
          setQuery={setQuery}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
        />
      )}

      {view === "collections" && <CollectionsView collectionSummaries={repositoryStore.collectionSummaries} />}

      {view === "favorites" && (
        <FavoritesView
          favorites={dashboard.favorites}
          onOpenRepository={openRepository}
          selectedRepoId={selectedRepoId}
        />
      )}

      {view === "detail" && (
        <RepositoryDetailView
          collections={selectedRepoCollections}
          notes={notesByRepoId[selectedRepo.id] ?? ""}
          repository={selectedRepo}
          setNotes={(nextNotes) => {
            setNotesByRepoId((current) => ({ ...current, [selectedRepo.id]: nextNotes }))
            setRepositoryStore((current) => ({
              ...current,
              repositoryNotes: current.repositoryNotes.map((note) =>
                note.repositoryId === selectedRepo.id ? { ...note, body: nextNotes } : note
              )
            }))
            void persistRepositoryNote(selectedRepo.id, nextNotes)
          }}
        />
      )}

      {view === "settings" && <SettingsView preferences={repositoryStore.userPreferences} />}
    </AppShell>
  )
}

export default App
