export type Props = {
  id: string
  label: string
  value: number | undefined | null
  className?: string
  allowFloat?: boolean
  onChange(value: number): void
}

export type State = {
  value: string
  id: string
}
