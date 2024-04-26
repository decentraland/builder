import React, { useCallback, useEffect, useState } from 'react'
import { Button, ButtonProps, CheckboxProps, InputOnChangeData, ModalActions, ModalContent, ModalNavigation, Tabs } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import { isValid } from 'lib/address'
import { Props } from './WorldPermissionsModal.types'
import { AllowListPermissionSetting, WorldPermissionNames, WorldPermissionType } from 'lib/api/worlds'
import WorldPermissionsAccess from './ModelTabs/WorldPermissionsAccess/WorldPermissionsAccess'
import WorldPermissionsCollaborators from './ModelTabs/WorldPermissionsCollaborators/WorldPermissionsCollaborators'

import styles from './WorldPermissionsModal.module.css'

enum TabsSection {
  Access = 'Access',
  Collaborators = 'Collaborators'
}

const WorldPermissionsModal = (props: Props) => {
  const {
    name,
    metadata,
    worldPermissions,
    isLoading,
    isLoadingNewUser,
    onPutWorldPermissionsRequest,
    onPostWorldPermissionsRequest,
    onDeleteWorldPermissionsRequest,
    onGetProfile,
    onGetWorldPermissions,
    onClose
  } = props
  const [newAddress, setNewAddress] = useState('')
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [errorInvalidAddress, setErrorInvalidAddress] = useState(false)
  const [isAccessUnrestricted, setAccessUnrestricted] = useState(worldPermissions?.access.type === WorldPermissionType.Unrestricted)
  const [collaboratorUserList, setCollaboratorUserList] = useState<string[]>([])
  const [tabSelected, setTabSelected] = useState<TabsSection>(
    metadata.isCollaboratorsTabShown ? TabsSection.Collaborators : TabsSection.Access
  )

  useEffect(() => {
    metadata.worldName && onGetWorldPermissions(metadata.worldName)
  }, [metadata.worldName])

  const loading = isLoading || !metadata.worldName || !worldPermissions

  useEffect(() => {
    setAccessUnrestricted(worldPermissions?.access.type === WorldPermissionType.Unrestricted)
  }, [worldPermissions?.access.type])

  useEffect(() => {
    if (
      tabSelected === TabsSection.Access &&
      worldPermissions?.access.type === WorldPermissionType.AllowList &&
      worldPermissions?.access.wallets.length > 0
    ) {
      const allowedWallets = new Set(worldPermissions.access.wallets)
      if (allowedWallets.has(newAddress.toLowerCase())) {
        setNewAddress('')
      }
    }
  }, [worldPermissions?.access, newAddress, tabSelected])

  useEffect(() => {
    if (tabSelected === TabsSection.Collaborators && collaboratorUserList.length > 0) {
      const allowedWallets = new Set(collaboratorUserList)
      if (allowedWallets.has(newAddress.toLowerCase())) {
        setNewAddress('')
      }
    }
  }, [collaboratorUserList, newAddress, tabSelected])

  useEffect(() => {
    setCollaboratorUserList(collaboratorUserList => {
      const newCollaboratorUserList = new Set(collaboratorUserList)

      if (worldPermissions?.deployment.type === WorldPermissionType.AllowList) {
        worldPermissions.deployment.wallets.forEach(wallet => {
          !newCollaboratorUserList.has(wallet) && newCollaboratorUserList.add(wallet.toLowerCase())
        })
      }
      if (worldPermissions?.streaming.type === WorldPermissionType.AllowList) {
        worldPermissions.streaming.wallets.forEach(wallet => {
          !newCollaboratorUserList.has(wallet) && newCollaboratorUserList.add(wallet.toLowerCase())
        })
      }
      return [...newCollaboratorUserList]
    })
  }, [worldPermissions])

  const handleAddUserToCollaboratorsList = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, _data: ButtonProps) => {
      if (newAddress === '') {
        setShowAddUserForm(false)
      }
      setErrorInvalidAddress(false)
      const isValidAddress = isValid(newAddress)
      if (!isValidAddress) {
        setErrorInvalidAddress(true)
      }
      if (isValidAddress && metadata.worldName && newAddress && !collaboratorUserList.includes(newAddress)) {
        setCollaboratorUserList(prev => [...prev, newAddress.toLowerCase()])
      }
      onGetProfile(newAddress)
    },
    [metadata.worldName, worldPermissions, newAddress, collaboratorUserList]
  )

  const handleUserPermissionList = useCallback(
    (_event: React.MouseEvent, data: CheckboxProps & { worldPermissionName: WorldPermissionNames; wallet: string }) => {
      const isValidAddress = isValid(data.wallet)
      if (!isValidAddress) {
        setErrorInvalidAddress(true)
        return
      }

      // If the permission doesn't exist, add it, if not, delete it
      if (
        worldPermissions?.[data.worldPermissionName].type === WorldPermissionType.AllowList &&
        !(worldPermissions[data.worldPermissionName] as AllowListPermissionSetting).wallets.includes(data.wallet.toLowerCase())
      ) {
        setErrorInvalidAddress(false)
        onPutWorldPermissionsRequest(metadata.worldName, data.worldPermissionName, WorldPermissionType.AllowList, data.wallet.toLowerCase())
      } else if (
        worldPermissions?.[data.worldPermissionName].type === WorldPermissionType.AllowList &&
        (worldPermissions[data.worldPermissionName] as AllowListPermissionSetting).wallets.includes(data.wallet.toLowerCase())
      ) {
        setErrorInvalidAddress(false)
        onDeleteWorldPermissionsRequest(
          metadata.worldName,
          data.worldPermissionName,
          WorldPermissionType.AllowList,
          data.wallet.toLowerCase()
        )
      }
    },
    [metadata.worldName, worldPermissions, newAddress]
  )

  const handleChangeAccessPermission = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
      const nextPermissionType = !data.checked ? WorldPermissionType.AllowList : WorldPermissionType.Unrestricted
      if (metadata.worldName && worldPermissions?.access.type !== nextPermissionType) {
        onPostWorldPermissionsRequest(metadata.worldName, WorldPermissionNames.Access, nextPermissionType)
      }
    },
    [metadata.worldName, worldPermissions]
  )

  const handleRemoveCollaborators = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps & { wallet: string }) => {
      if (!metadata.worldName) {
        return
      }

      // Delete the collaborator's deployment permission
      if (
        worldPermissions?.deployment.type === WorldPermissionType.AllowList &&
        worldPermissions.deployment.wallets.includes(data.wallet)
      ) {
        onDeleteWorldPermissionsRequest(metadata.worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList, data.wallet)
      }

      // Delete the collaborator's streaming permission
      if (worldPermissions?.streaming.type === WorldPermissionType.AllowList && worldPermissions.streaming.wallets.includes(data.wallet)) {
        onDeleteWorldPermissionsRequest(metadata.worldName, WorldPermissionNames.Streaming, WorldPermissionType.AllowList, data.wallet)
      }

      // As the list can have temporarily collaborators without permissions, remove them from the list
      setCollaboratorUserList(collaboratorUserList => {
        const newCollaboratorUserList = new Set(collaboratorUserList)
        newCollaboratorUserList.delete(data.wallet.toLowerCase())
        return [...newCollaboratorUserList]
      })
    },
    [metadata.worldName, worldPermissions, newAddress]
  )

  const handleNewAddressChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setNewAddress(data.value || '')
      setErrorInvalidAddress(false)
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

  return (
    <Modal name={name} onClose={onClose} className={styles.worldPermissions}>
      <ModalNavigation
        title={
          loading ? (
            <LoadingText type="h1" size="large"></LoadingText>
          ) : (
            t('world_permissions_modal.title', { world_name: <span>{metadata.worldName}</span>, br: () => <br /> })
          )
        }
        onClose={onClose}
      />
      <ModalContent>
        <Tabs className={styles.permissionsTabs}>
          <Tabs.Tab active={tabSelected === TabsSection.Access} onClick={e => handleChangeTab(e, TabsSection.Access)}>
            {loading ? <LoadingText type="span" size="small"></LoadingText> : t('world_permissions_modal.tab_access.label')}
          </Tabs.Tab>
          <Tabs.Tab active={tabSelected === TabsSection.Collaborators} onClick={e => handleChangeTab(e, TabsSection.Collaborators)}>
            {loading ? <LoadingText type="span" size="small"></LoadingText> : t('world_permissions_modal.tab_collaborators.label')}
          </Tabs.Tab>
        </Tabs>

        {tabSelected === TabsSection.Access && (
          <WorldPermissionsAccess
            newAddress={newAddress}
            error={errorInvalidAddress}
            worldAccessPermissions={worldPermissions?.access}
            showAddUserForm={showAddUserForm}
            onChangeAccessPermission={handleChangeAccessPermission}
            onShowAddUserForm={handleShowAddUserForm}
            onNewAddressChange={handleNewAddressChange}
            onUserPermissionListChange={handleUserPermissionList}
            isLoadingNewUser={!!isLoadingNewUser}
            isAccessUnrestricted={isAccessUnrestricted}
            loading={loading}
          />
        )}

        {tabSelected === TabsSection.Collaborators && (
          <WorldPermissionsCollaborators
            loading={loading}
            newAddress={newAddress}
            collaboratorUserList={collaboratorUserList}
            worldDeploymentPermissions={worldPermissions?.deployment}
            worldStreamingPermissions={worldPermissions?.streaming}
            showAddUserForm={showAddUserForm}
            onShowAddUserForm={handleShowAddUserForm}
            onNewAddressChange={handleNewAddressChange}
            onRemoveCollaborator={handleRemoveCollaborators}
            onAddUserToCollaboratorsList={handleAddUserToCollaboratorsList}
            onUserPermissionListChange={handleUserPermissionList}
            error={errorInvalidAddress}
          />
        )}
      </ModalContent>
      <ModalActions>
        <Button primary onClick={onClose}>
          {t('world_permissions_modal.close')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default WorldPermissionsModal
