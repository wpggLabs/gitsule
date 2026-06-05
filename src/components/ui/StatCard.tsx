type Props = {
  label: string
  value: string
}

export function StatCard({ label, value }: Props) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="font-mono text-2xl text-zinc-50">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{label}</div>
    </div>
  )
}
