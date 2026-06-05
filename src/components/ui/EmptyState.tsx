type Props = {
  title: string
  body: string
}

export function EmptyState({ title, body }: Props) {
  return (
    <div className="rounded-md border border-dashed border-zinc-800 bg-zinc-950/50 p-6 text-center">
      <div className="font-medium text-zinc-100">{title}</div>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{body}</p>
    </div>
  )
}
