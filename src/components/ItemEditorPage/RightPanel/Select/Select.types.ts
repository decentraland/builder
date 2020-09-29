export type Props<T extends string> = {
  itemId: string
  label: string
  value: T | null | undefined
  options: { value: T; text: string }[]
  onChange: (newValue: T) => void
}

export type State = {
  value: string
}
