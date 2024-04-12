import React from 'react'

import { Checkbox, Button, Icon as DCLIcon, Field, AvatarFace, Table } from 'decentraland-ui'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'

import Icon from 'components/Icon'
import { WorldPermissionsCollaboratorsProps } from './WorldPermissionsCollaborators.types'
import { WorldPermissionNames } from 'lib/api/worlds'

const getResumedAddress = (address: string) => address.substring(0, 6) + '...' + address.substring(address.length - 6)

export default React.memo(function WorldPermissionsCollaborators(props: WorldPermissionsCollaboratorsProps) {
  const {
    loading,
    newAddress,
    collaboratorUserList,
    worldDeploymentPermissions,
    worldStreamingPermissions,
    showAddUserForm,
    profiles,
    onShowAddUserForm,
    onNewAddressChange,
    onRemoveCollaborator,
    onAddUserToColaboratorList,
    onUserPermissionListChange,
    error
  } = props
  return (
    <div className="world-permissions__tab-collaborators">
      {loading && <LoadingText type="h1" size="small"></LoadingText>}
      {!loading && <h1>Collaborators</h1>}
      {loading && <LoadingText type="p" size="full"></LoadingText>}
      {!loading && <p>Manage other’s users role permissions to your WORLD up to 10 addresses.</p>}
      {loading && <LoadingText type="p" size="full"></LoadingText>}

      <div className="tab-content__add-user-wrapper">
        {!showAddUserForm && (
          <div className="tab-content__add-user-button-container">
            <Button onClick={onShowAddUserForm}>
              <DCLIcon name="plus" />
              Add Colaborator
            </Button>
          </div>
        )}
        {showAddUserForm && (
          <div className="tab-content__add-user-form-container">
            <Field
              className="tab-content__new-address-input"
              placeholder="0x..."
              value={newAddress}
              onChange={onNewAddressChange}
              kind="full"
              type="address"
              error={error}
              message={error && 'invalid address'}
            />
            <Button onClick={onAddUserToColaboratorList}>{newAddress === '' ? 'Cancel' : 'Add'}</Button>
          </div>
        )}
      </div>

      <div className="collaborators-list">
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Collaboratos</Table.HeaderCell>
              <Table.HeaderCell>Deploy</Table.HeaderCell>
              <Table.HeaderCell>Streaming</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {collaboratorUserList?.map((wallet, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <AvatarFace avatar={profiles[wallet]} size="small" inline />
                  <p>
                    {profiles[wallet] && profiles[wallet].hasClaimedName && <span>{profiles[wallet].name}</span>}
                    {getResumedAddress(wallet)}{' '}
                  </p>
                </Table.Cell>
                <Table.Cell>
                  <Checkbox
                    onChange={e =>
                      onUserPermissionListChange(e as React.MouseEvent<HTMLInputElement, MouseEvent>, {
                        wallet,
                        worldPermissionName: WorldPermissionNames.Deployment
                      })
                    }
                    checked={worldDeploymentPermissions?.wallets.includes(wallet)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Checkbox
                    onChange={e =>
                      onUserPermissionListChange(e as React.MouseEvent<HTMLInputElement, MouseEvent>, {
                        wallet,
                        worldPermissionName: WorldPermissionNames.Streaming
                      })
                    }
                    checked={worldStreamingPermissions?.wallets.includes(wallet)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Button basic wallet={wallet} onClick={e => onRemoveCollaborator(e, { wallet })}>
                    <Icon name="close" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
})
