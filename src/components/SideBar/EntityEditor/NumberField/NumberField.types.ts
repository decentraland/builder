export type Props = {
  label: string
  value: number
  className?: string
  allowFloat?: boolean
  onChange(value: number): void
}

export type State = {
  value: string
}
