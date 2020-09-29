export type Props = {
  itemId: string
  label: string
  value?: string | null
  onChange: (newValue: string) => void
}

export type State = {
  value: string
}
