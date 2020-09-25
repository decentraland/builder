export type Props = {
  itemId: string
  label: string
  value: string | null | undefined
  onChange: (newValue: string) => void
}

export type State = {
  value: string
}
