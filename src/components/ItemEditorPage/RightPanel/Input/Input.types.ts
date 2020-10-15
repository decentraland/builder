export type Props = {
  itemId: string
  label: string
  disabled?: boolean
  value?: string | null
  onChange: (newValue: string) => void
}

export type State = {
  value: string
}
