export type Props = {
  id: string
  label: string
  value: boolean
  className?: string
  onChange(id: string, value: boolean): void
}

export type State = {
  value: boolean
}
