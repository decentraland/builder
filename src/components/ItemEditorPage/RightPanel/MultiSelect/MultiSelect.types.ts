export type Props<T extends string> = {
  itemId: string
  label: string
  value: T[]
  options: { value: T; text: string }[]
  onChange: (newValue: T[]) => void
}

export type State<T> = {
  value: T[]
}
