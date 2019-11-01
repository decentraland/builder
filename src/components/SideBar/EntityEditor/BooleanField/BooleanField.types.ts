export type Props = {
  label: string
  value: boolean
  className?: string
  onChange(value: boolean): void
}

export type State = {
  value: boolean
}
