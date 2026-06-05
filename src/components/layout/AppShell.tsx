import type { ReactNode } from "react"
import type { View } from "../../types/navigation"
import { Sidebar } from "./Sidebar"

type Props = {
  activeView: View
  children: ReactNode
  collectionCount: number
  onNavigate: (view: View) => void
  repositoryCount: number
}

export function AppShell({ activeView, children, collectionCount, onNavigate, repositoryCount }: Props) {
  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100">
      <div className="flex min-h-screen">
        <Sidebar
          activeView={activeView}
          collectionCount={collectionCount}
          onNavigate={onNavigate}
          repositoryCount={repositoryCount}
        />
        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="mx-auto max-w-7xl px-8 py-7">{children}</div>
        </main>
      </div>
    </div>
  )
}
