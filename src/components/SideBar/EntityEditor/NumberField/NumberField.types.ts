export type Props = {
  id: string
  label: string
  value: number | undefined
  className?: string
  allowFloat?: boolean
  onChange(value: number): void
}

export type State = {
  value: string
  id: string
}
