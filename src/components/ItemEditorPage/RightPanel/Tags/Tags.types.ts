export type Props = {
  itemId: string
  value: string[]
  isDisabled?: boolean
  onChange: (newValue: string[]) => void
}

export type State = {
  draft: string
  value: string[]
}
