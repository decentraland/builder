export type Props = {
  id: string
  label: string
  value: string
  className?: string
  onChange(id: string, value: string): void
}

export type State = {
  value: string
}
