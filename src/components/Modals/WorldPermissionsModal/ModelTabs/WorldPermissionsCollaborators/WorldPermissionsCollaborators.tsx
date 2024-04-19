import React from 'react'

import { Table } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

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
        title={t('world_permissions_modal.tab_collaborators.title')}
        description={t('world_permissions_modal.tab_collaborators.description')}
        loading={loading}
      />

      <WorldPermissionsAddUserForm
        showAddUserForm={showAddUserForm}
        newAddress={newAddress}
        isLoadingNewUser={loading}
        addButtonLabel={t('world_permissions_modal.tab_collaborators.button_add_collaborator_label')}
        error={error}
        onShowAddUserForm={onShowAddUserForm}
        onNewAddressChange={onNewAddressChange}
        onUserPermissionListChange={onAddUserToColaboratorList}
      />

      <div className="world-permissions__collaborators-list">
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {loading ? (
                  <LoadingText type="p" size="medium"></LoadingText>
                ) : (
                  t('world_permissions_modal.tab_collaborators.column_name_label', { number: `${collaboratorUserList?.length}/10` })
                )}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {loading ? (
                  <LoadingText type="p" size="medium"></LoadingText>
                ) : (
                  t('world_permissions_modal.tab_collaborators.column_deploy_label')
                )}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {loading ? (
                  <LoadingText type="p" size="medium"></LoadingText>
                ) : (
                  t('world_permissions_modal.tab_collaborators.column_stream_label')
                )}
              </Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
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
