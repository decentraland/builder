export type Props = {
  onAdd: (manager: string) => void
  onCancel: () => void
}

export type State = {
  manager: string
}
