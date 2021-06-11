export type Props = {
  onAdd: (address: string) => void
  onCancel: () => void
}

export type State = {
  address: string
}
