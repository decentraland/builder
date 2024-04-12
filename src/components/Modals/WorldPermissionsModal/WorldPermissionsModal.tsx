import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ButtonProps, CheckboxProps, InputOnChangeData, ModalActions, ModalContent, ModalNavigation, Tabs } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import { isValid } from 'lib/address'
import { Props } from './WorldPermissionsModal.types'
import { AllowListPermissionSetting, WorldPermissionNames, WorldPermissionType } from 'lib/api/worlds'
import WorldPermissionsAccess from './ModelTabs/WorldPermissionsAccess'

import './WorldPermissionsModal.css'
import WorldPermissionsCollaborators from './ModelTabs/WorldPermissionsCollaborators'

const WorldPermissionsModal = (props: Props) => {
  const {
    name,
    metadata,
    worldPermissions,
    profiles,
    isLoading,
    onPutWorldPermissionsRequest,
    onPostWorldPermissionsRequest,
    onDeleteWorldPermissionsRequest,
    onClose
  } = props
  const [newAddress, setNewAddress] = useState('')
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [errorInvalidAddress, setErrorInvalidAddress] = useState(false)
  const [isAccessUnrestricted, setAccessUnrestricted] = useState(worldPermissions?.access.type === WorldPermissionType.Unrestricted)
  const [collaboratorUserList, setCollaboratorUserList] = useState<string[]>([])
  const localLoading = isLoading || !metadata.worldName || !worldPermissions

  useEffect(() => {
    setCollaboratorUserList(() => {
      const newCollaboratorUserList: string[] = []

      if (worldPermissions?.deployment.type === WorldPermissionType.AllowList && worldPermissions.deployment.wallets.length > 0) {
        newCollaboratorUserList.push(...worldPermissions.deployment.wallets)
      }
      if (worldPermissions?.streaming.type === WorldPermissionType.AllowList && worldPermissions.streaming.wallets.length > 0) {
        newCollaboratorUserList.push(...worldPermissions.streaming.wallets)
      }

      return [...new Set(newCollaboratorUserList)]
    })
  }, [worldPermissions])

  const profilesByWallets = useMemo(() => profiles, [profiles])

  const handleAddUserToColaboratorList = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, _data: ButtonProps) => {
      if (newAddress === '') {
        setShowAddUserForm(false)
      }
      const isValidAddress = isValid(newAddress)
      if (!isValidAddress) {
        setErrorInvalidAddress(true)
      }
      if (isValidAddress && metadata.worldName && newAddress && !collaboratorUserList.includes(newAddress)) {
        setCollaboratorUserList(prev => [...prev, newAddress])
      }
    },
    [metadata.worldName, worldPermissions, newAddress, collaboratorUserList]
  )

  const handleUserPermissionList = useCallback(
    (_event: React.MouseEvent, data: CheckboxProps & { worldPermissionName: WorldPermissionNames; wallet: string }) => {
      if (
        worldPermissions?.[data.worldPermissionName].type === WorldPermissionType.AllowList &&
        !(worldPermissions[data.worldPermissionName] as AllowListPermissionSetting).wallets.includes(data.wallet)
      ) {
        onPutWorldPermissionsRequest(metadata.worldName, data.worldPermissionName, WorldPermissionType.AllowList, data.wallet)
      }
      if (
        worldPermissions?.[data.worldPermissionName].type === WorldPermissionType.AllowList &&
        (worldPermissions[data.worldPermissionName] as AllowListPermissionSetting).wallets.includes(data.wallet)
      ) {
        onDeleteWorldPermissionsRequest(metadata.worldName, data.worldPermissionName, WorldPermissionType.AllowList, data.wallet)
      }
    },
    [metadata.worldName, worldPermissions, newAddress]
  )

  const handleChangeAccessPermission = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
      const nextPermissionType = !data.checked ? WorldPermissionType.AllowList : WorldPermissionType.Unrestricted
      if (metadata.worldName && worldPermissions?.access.type !== nextPermissionType) {
        setAccessUnrestricted(!!data.checked)
        onPostWorldPermissionsRequest(metadata.worldName, WorldPermissionNames.Access, nextPermissionType)
      }
    },
    [metadata.worldName, worldPermissions]
  )

  const handleRemoveCollaborators = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps & { wallet: string }) => {
      if (
        metadata.worldName &&
        worldPermissions?.deployment.type === WorldPermissionType.AllowList &&
        worldPermissions.deployment.wallets.includes(data.wallet)
      ) {
        onDeleteWorldPermissionsRequest(metadata.worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, data.wallet)
      }

      if (
        metadata.worldName &&
        worldPermissions?.streaming.type === WorldPermissionType.AllowList &&
        worldPermissions.streaming.wallets.includes(data.wallet)
      ) {
        onDeleteWorldPermissionsRequest(metadata.worldName, WorldPermissionNames.Streaming, WorldPermissionType.AllowList, data.wallet)
      }
    },
    [metadata.worldName, worldPermissions, newAddress]
  )

  const handleNewAddressChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setNewAddress(data.value || '')
    },
    [setNewAddress]
  )

  const handleShowAddUserForm = useCallback((_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, _data: ButtonProps) => {
    setShowAddUserForm(prev => !prev)
    setErrorInvalidAddress(false)
    setNewAddress('')
  }, [])

  const handleChangeTab = useCallback((_event: React.MouseEvent<HTMLDivElement, MouseEvent>, nextTab: TabsSection) => {
    setShowAddUserForm(false)
    setErrorInvalidAddress(false)
    setNewAddress('')
    setTabSelected(nextTab)
  }, [])

  enum TabsSection {
    Access = 'Access',
    Collaborators = 'Collaborators'
  }

  const [tabSelected, setTabSelected] = useState<TabsSection>(TabsSection.Access)

  return (
    <Modal name={name} onClose={onClose} className="world-permissions">
      <ModalNavigation title={localLoading ? <LoadingText type="h1" size="large"></LoadingText> : 'World Permissions'} onClose={onClose} />
      <ModalContent>
        <Tabs className="world-permissions__tabs">
          <Tabs.Tab active={tabSelected === TabsSection.Access} onClick={e => handleChangeTab(e, TabsSection.Access)}>
            {localLoading ? <LoadingText type="span" size="small"></LoadingText> : 'Access'}
          </Tabs.Tab>
          <Tabs.Tab active={tabSelected === TabsSection.Collaborators} onClick={e => handleChangeTab(e, TabsSection.Collaborators)}>
            {localLoading ? <LoadingText type="span" size="small"></LoadingText> : 'Collaborators'}
          </Tabs.Tab>
        </Tabs>

        {tabSelected === TabsSection.Access && (
          <WorldPermissionsAccess
            newAddress={newAddress}
            error={errorInvalidAddress}
            worldAccessPermissions={worldPermissions?.access}
            showAddUserForm={showAddUserForm}
            profiles={profilesByWallets}
            onChangeAccessPermission={handleChangeAccessPermission}
            onShowAddUserForm={handleShowAddUserForm}
            onNewAddressChange={handleNewAddressChange}
            onUserPermissionListChange={handleUserPermissionList}
            isAccessUnrestricted={isAccessUnrestricted}
            loading={localLoading}
          />
        )}

        {tabSelected === TabsSection.Collaborators && (
          <WorldPermissionsCollaborators
            loading={localLoading}
            newAddress={newAddress}
            collaboratorUserList={collaboratorUserList}
            worldDeploymentPermissions={worldPermissions?.deployment}
            worldStreamingPermissions={worldPermissions?.streaming}
            showAddUserForm={showAddUserForm}
            profiles={profilesByWallets}
            onShowAddUserForm={handleShowAddUserForm}
            onNewAddressChange={handleNewAddressChange}
            onRemoveCollaborator={handleRemoveCollaborators}
            onAddUserToColaboratorList={handleAddUserToColaboratorList}
            onUserPermissionListChange={handleUserPermissionList}
            error={errorInvalidAddress}
          />
        )}
      </ModalContent>
      <ModalActions>
        <Button primary onClick={onClose}>
          Close
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default WorldPermissionsModal
