import React from 'react'

import { Icon, Popup, Table } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

import { WorldPermissionsCollaboratorsProps } from './WorldPermissionsCollaborators.types'
import { WorldPermissionsAddUserForm } from '../Layouts/WorldPermissionsAddUserForm'
import { WorldPermissionsHeader } from '../Layouts/WorldPermissionsHeader'
import { WorldPermissionsCollaboratorsItem } from './WorldPermissionsCollaboratorsItem/WorldPermissionsCollaboratorsItem'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'

import styles from './WorldPermissionsCollaborators.module.css'

export default React.memo((props: WorldPermissionsCollaboratorsProps) => {
  const {
    loading,
    newAddress,
    collaboratorUserList,
    showAddUserForm,
    onShowAddUserForm,
    onNewAddressChange,
    onAddUserToCollaboratorsList,
    onUserPermissionListChange,
    onRemoveCollaborator,
    error,
    worldDeploymentPermissions,
    worldStreamingPermissions
  } = props
  return (
    <div>
      <WorldPermissionsHeader
        description={
          <T
            id="world_permissions_modal.tab_collaborators.description"
            values={
              {
                span: (text: string) => <span>{text}</span>
              } as Record<string, React.ReactNode | ((chunks: React.ReactNode) => React.ReactNode)>
            }
          />
        }
        loading={loading}
      />

      {(!collaboratorUserList || collaboratorUserList.length < 10) && (
        <WorldPermissionsAddUserForm
          showAddUserForm={showAddUserForm}
          newAddress={newAddress}
          isLoading={loading}
          isLoadingNewUser={loading}
          addButtonLabel={t('world_permissions_modal.tab_collaborators.button_add_collaborator_label')}
          error={error}
          onShowAddUserForm={onShowAddUserForm}
          onNewAddressChange={onNewAddressChange}
          onUserPermissionListChange={onAddUserToCollaboratorsList}
        />
      )}

      <div className={styles.collaboratorsList}>
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
                  <>
                    {t('world_permissions_modal.tab_collaborators.column_deploy_label')}
                    <Popup
                      className="modal-tooltip"
                      content={t('world_permissions_modal.tab_collaborators.column_deploy_tooltip')}
                      position="top center"
                      trigger={<Icon name="info" />}
                    />
                  </>
                )}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {loading ? (
                  <LoadingText type="p" size="medium"></LoadingText>
                ) : (
                  <>
                    {t('world_permissions_modal.tab_collaborators.column_stream_label')}
                    <Popup
                      className="modal-tooltip"
                      content={t('world_permissions_modal.tab_collaborators.column_stream_tooltip')}
                      position="top center"
                      trigger={<Icon name="info" />}
                    />
                  </>
                )}
              </Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {!loading ? (
              !collaboratorUserList || collaboratorUserList.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="4">
                    <div className={styles.emptyList}>
                      <T id="world_permissions_modal.tab_collaborators.empty_list" />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                collaboratorUserList?.map((wallet, index) => (
                  <WorldPermissionsCollaboratorsItem
                    onUserPermissionListChange={onUserPermissionListChange}
                    onRemoveCollaborator={onRemoveCollaborator}
                    hasWorldDeploymentPermission={worldDeploymentPermissions?.wallets.includes(wallet)}
                    hasWorldStreamingPermission={worldStreamingPermissions?.wallets.includes(wallet)}
                    key={index}
                    walletAddress={wallet}
                  />
                ))
              )
            ) : (
              Array.from(Array(4), (_, key) => <WorldPermissionsCollaboratorsItem key={key} loading={loading} />)
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
})
