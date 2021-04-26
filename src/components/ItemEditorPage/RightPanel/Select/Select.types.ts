export type Props<T extends string> = {
  itemId: string
  label: string
  value: T | undefined
  options: { value: T; text: string }[]
  disabled?: boolean
  onChange: (newValue: T) => void
}

export type State<T> = {
  value: T | undefined
}
