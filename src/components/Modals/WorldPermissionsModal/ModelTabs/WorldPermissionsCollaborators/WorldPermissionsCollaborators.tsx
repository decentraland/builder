import React from 'react'

import { Table } from 'decentraland-ui'

import { WorldPermissionsCollaboratorsProps } from './WorldPermissionsCollaborators.types'
import WorldPermissionsAddUserForm from '../Layouts/WorldPermissionsAddUserForm'
import WorldPermissionsHeader from '../Layouts/WorldPermissionsHeader'
import WorldPermissionsCollaboratorsItem from './WorldPermissionsCollaboratorsItem'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'

import './WorldPermissionsCollaborators.css'

export default React.memo(function WorldPermissionsCollaborators(props: WorldPermissionsCollaboratorsProps) {
  const {
    loading: newLoading,
    newAddress,
    collaboratorUserList,
    showAddUserForm,
    onShowAddUserForm,
    onNewAddressChange,
    onAddUserToColaboratorList,
    error,
    ...worldPermissionsCollaboratorsItemProps
  } = props
  const loading = false
  return (
    <div className="world-permissions__tab-collaborators">
      <WorldPermissionsHeader
        title="Collaborators"
        description="Manage other’s users role permissions to your WORLD up to 10 addresses."
        loading={loading}
      />

      <WorldPermissionsAddUserForm
        showAddUserForm={showAddUserForm}
        newAddress={newAddress}
        isLoadingNewUser={loading}
        addButtonLabel="Add Colaborator"
        error={error}
        onShowAddUserForm={onShowAddUserForm}
        onNewAddressChange={onNewAddressChange}
        onUserPermissionListChange={onAddUserToColaboratorList}
      />

      <div className="world-permissions__collaborators-list">
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{loading ? <LoadingText type="p" size="medium"></LoadingText> : 'Collaboratos'}</Table.HeaderCell>
              <Table.HeaderCell>{loading ? <LoadingText type="p" size="medium"></LoadingText> : 'Deploy'}</Table.HeaderCell>
              <Table.HeaderCell>{loading ? <LoadingText type="p" size="medium"></LoadingText> : 'Streaming'}</Table.HeaderCell>
              <Table.HeaderCell>{loading ? <LoadingText type="p" size="medium"></LoadingText> : 'Actions'}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {!loading &&
              collaboratorUserList?.map((wallet, index) => (
                <WorldPermissionsCollaboratorsItem {...worldPermissionsCollaboratorsItemProps} key={index} wallet={wallet} />
              ))}

            {loading && Array.from(Array(4), (_, key) => <WorldPermissionsCollaboratorsItem key={key} loading={loading} />)}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
})
