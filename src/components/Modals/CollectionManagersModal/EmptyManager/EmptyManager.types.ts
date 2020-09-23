export type Props = {
  onAdd: (collaborator: string) => void
  onCancel: () => void
}

export type State = {
  collaborator: string
}
