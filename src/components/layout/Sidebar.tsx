import type { View } from "../../types/navigation"

type Props = {
  activeView: View
  collectionCount: number
  onNavigate: (view: View) => void
  repositoryCount: number
}

const navItems: Array<{ id: View; label: string }> = [
  { id: "home", label: "Home" },
  { id: "library", label: "Library" },
  { id: "collections", label: "Collections" },
  { id: "settings", label: "Settings" }
]

export function Sidebar({ activeView, collectionCount, onNavigate, repositoryCount }: Props) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-850 bg-[#0d1017] px-4 py-5">
      <div className="mb-8 flex items-center gap-3">
        <img alt="" className="block h-8 w-8 shrink-0" src="/gitsule-mark.svg" />
        <div className="min-w-0">
          <div className="text-xl font-semibold tracking-tight">Gitsule</div>
          <div className="mt-1 truncate text-xs text-zinc-500">GitHub discoveries capsule</div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
              activeView === item.id ? "bg-github text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Local Library</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Metric label="Repos" value={repositoryCount.toString()} />
          <Metric label="Collections" value={collectionCount.toString()} />
        </div>
      </div>
    </aside>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-lg text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  )
}
