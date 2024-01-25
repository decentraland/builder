export type Props = {
  isEnsAddressEnabled: boolean
  onAdd: (address: string) => void
  onCancel: () => void
}

export type State = {
  address: string
}
