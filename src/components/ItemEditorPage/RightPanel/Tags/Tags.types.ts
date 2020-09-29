export type Props = {
  itemId: string
  value: string[]
  onChange: (newValue: string[]) => void
}

export type State = {
  draft: string
  value: string[]
}
