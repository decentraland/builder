export type Props = {
  showAddUserForm: boolean
  newAddress: string
  isLoading: boolean
  isLoadingNewUser: boolean
  addButtonLabel: string
  error: boolean
  onShowAddUserForm: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) => void
  onNewAddressChange: (e: React.ChangeEvent<HTMLInputElement>, data: any) => void
  onUserPermissionListChange: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) => void
}
