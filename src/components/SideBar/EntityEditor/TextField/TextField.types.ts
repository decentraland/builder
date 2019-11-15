export type Props = {
  label: string
  value: string
  id: string
  className?: string
  onChange(value: string): void
}

export type State = {
  value: string
  id: string
}
