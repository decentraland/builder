export type Props = {
  label: string
  value: string
  className?: string
  onChange(value: string): void
}

export type State = {
  value: string
}
