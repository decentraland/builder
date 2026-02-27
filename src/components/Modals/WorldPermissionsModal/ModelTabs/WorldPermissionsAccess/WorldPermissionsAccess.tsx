import React from 'react'

import classNames from 'classnames'
import { Checkbox, Icon } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

import { WorldPermissionType } from 'lib/api/worlds'
import { WorldPermissionsAccessProps } from './WorldPermissionsAccess.types'

import { WorldPermissionsAccessItem } from './WorldPermissionsAccessItem/WorldPermissionsAccessItem'
import { WorldPermissionsAddUserForm } from '../Layouts/WorldPermissionsAddUserForm'
import { WorldPermissionsHeader } from '../Layouts/WorldPermissionsHeader'

import styles from './WorldPermissionsAccess.module.css'

export default React.memo(function WorldPermissionsAccess(props: WorldPermissionsAccessProps) {
  const {
    loading,
    isLoadingNewUser,
    newAddress,
    worldAccessPermissions,
    isAccessUnrestricted,
    showAddUserForm,
    onChangeAccessPermission,
    onShowAddUserForm,
    onNewAddressChange,
    onUserPermissionListChange,
    error
  } = props
  return (
    <div className={classNames([styles.tabAccess, isAccessUnrestricted && 'unrestricted'])}>
      <WorldPermissionsHeader
        description={
          <T
            id="world_permissions_modal.tab_access.description"
            values={
              {
                br: () => <br />,
                span: (text: string) => <span>{text}</span>
              } as Record<string, React.ReactNode | ((chunks: React.ReactNode) => React.ReactNode)>
            }
          />
        }
        loading={loading}
      />

      {!loading && !isAccessUnrestricted && (
        <div className={styles.warning}>
          <Icon className={styles.warningIcon} name="exclamation triangle" />
          <p className={styles.warningParagraph}>
            <T
              id="world_permissions_modal.tab_access.warning"
              values={
                {
                  b: (text: string) => <span>{text}</span>
                } as Record<string, React.ReactNode | ((chunks: React.ReactNode) => React.ReactNode)>
              }
            />
          </p>
        </div>
      )}

      {!loading && (
        <div className={styles.publicAccess}>
          <div>
            <span className={styles.privateLabel}>{t('world_permissions_modal.tab_access.private')}</span>
            <Checkbox
              toggle
              label={t('world_permissions_modal.tab_access.public')}
              checked={isAccessUnrestricted}
              onChange={onChangeAccessPermission}
              aria-label={t('world_permissions_modal.tab_access.public')}
            />
          </div>
          <span className={styles.approvedCount}>
            {worldAccessPermissions?.type === WorldPermissionType.AllowList &&
              t('world_permissions_modal.tab_access.approved_addresses', { number: `${worldAccessPermissions?.wallets.length}/100` })}
          </span>
        </div>
      )}

      {!isAccessUnrestricted && (
        <WorldPermissionsAddUserForm
          showAddUserForm={showAddUserForm}
          newAddress={newAddress}
          isLoading={loading}
          isLoadingNewUser={isLoadingNewUser}
          addButtonLabel={t('world_permissions_modal.tab_access.button_add_address_label')}
          error={error}
          onShowAddUserForm={onShowAddUserForm}
          onNewAddressChange={onNewAddressChange}
          onUserPermissionListChange={onUserPermissionListChange}
        />
      )}

      {!isAccessUnrestricted && !loading && (
        <div className={styles.accessList}>
          {worldAccessPermissions?.type === WorldPermissionType.AllowList &&
            worldAccessPermissions.wallets?.map((wallet, index) => {
              const address = wallet.toLowerCase()
              return (
                <WorldPermissionsAccessItem key={index} walletAddress={address} onUserPermissionListChange={onUserPermissionListChange} />
              )
            })}
          {worldAccessPermissions?.type === WorldPermissionType.AllowList &&
            !isLoadingNewUser &&
            worldAccessPermissions.wallets.length === 0 && (
              <div className={styles.emptyList}>
                <T id="world_permissions_modal.tab_access.empty_list" />
              </div>
            )}
          {isLoadingNewUser && (
            <WorldPermissionsAccessItem onUserPermissionListChange={onUserPermissionListChange} loading={isLoadingNewUser} />
          )}
        </div>
      )}

      {loading && (
        <div className={styles.accessList}>
          {Array.from(Array(4), (_, key) => (
            <WorldPermissionsAccessItem onUserPermissionListChange={onUserPermissionListChange} key={key} loading={loading} />
          ))}
        </div>
      )}
    </div>
  )
})
