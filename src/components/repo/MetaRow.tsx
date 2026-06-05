type Props = {
  label: string
  value: string
}

export function MetaRow({ label, value }: Props) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-zinc-300">{value}</dd>
    </div>
  )
}
