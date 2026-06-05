type Props = {
  label: string
  value: string
}

export function DetailMetric({ label, value }: Props) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="text-sm font-medium text-zinc-100">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  )
}
