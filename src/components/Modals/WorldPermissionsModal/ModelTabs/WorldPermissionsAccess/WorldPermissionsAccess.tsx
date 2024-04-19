import React from 'react'

import classNames from 'classnames'
import { Checkbox } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { WorldPermissionType } from 'lib/api/worlds'
import { WorldPermissionsAccessProps } from './WorldPermissionsAccess.types'

import WorldPermissionsAccessItem from './WorldPermissionsAccessItem'
import WorldPermissionsAddUserForm from '../Layouts/WorldPermissionsAddUserForm'
import WorldPermissionsHeader from '../Layouts/WorldPermissionsHeader'

import './WorldPermissionsAccess.css'

export default React.memo(function WorldPermissionsAccess(props: WorldPermissionsAccessProps) {
  const {
    loading,
    isLoadingNewUser,
    newAddress,
    worldAccessPermissions,
    isAccessUnrestricted,
    showAddUserForm,
    profiles,
    onChangeAccessPermission,
    onShowAddUserForm,
    onNewAddressChange,
    onUserPermissionListChange,
    error
  } = props
  return (
    <div className={classNames(['world-permissions__tab-access', isAccessUnrestricted && 'unrestricted'])}>
      <WorldPermissionsHeader
        title={t('world_permissions_modal.tab_access.title')}
        description={t('world_permissions_modal.tab_access.description', {
          br: () => <br />
        })}
        loading={loading}
      />

      {!loading && (
        <div className="public-access-container">
          <span>
            {worldAccessPermissions?.type === WorldPermissionType.AllowList &&
              t('world_permissions_modal.tab_access.approved_addresses', { number: `${worldAccessPermissions?.wallets.length}/100` })}
          </span>
          <Checkbox
            toggle
            label={t('world_permissions_modal.tab_access.world_is', {
              type: isAccessUnrestricted ? t('world_permissions_modal.tab_access.public') : t('world_permissions_modal.tab_access.private')
            })}
            checked={isAccessUnrestricted}
            onChange={onChangeAccessPermission}
            aria-label={t('world_permissions_modal.tab_access.world_is', {
              type: isAccessUnrestricted ? t('world_permissions_modal.tab_access.public') : t('world_permissions_modal.tab_access.private')
            })}
          />
        </div>
      )}

      {!isAccessUnrestricted && (
        <WorldPermissionsAddUserForm
          showAddUserForm={showAddUserForm}
          newAddress={newAddress}
          isLoadingNewUser={isLoadingNewUser}
          addButtonLabel={t('world_permissions_modal.tab_access.button_add_address_label')}
          error={error}
          onShowAddUserForm={onShowAddUserForm}
          onNewAddressChange={onNewAddressChange}
          onUserPermissionListChange={onUserPermissionListChange}
        />
      )}

      {!isAccessUnrestricted && !loading && (
        <div className="access-list">
          {worldAccessPermissions?.type === WorldPermissionType.AllowList &&
            worldAccessPermissions.wallets?.map((wallet, index) => {
              const address = wallet.toLowerCase()
              return (
                <WorldPermissionsAccessItem
                  key={index}
                  address={address}
                  profiles={profiles}
                  onUserPermissionListChange={onUserPermissionListChange}
                  loading={loading}
                />
              )
            })}
          {isLoadingNewUser && <WorldPermissionsAccessItem loading={isLoadingNewUser} />}
        </div>
      )}

      {loading && (
        <div className="access-list">
          {Array.from(Array(4), (_, key) => (
            <WorldPermissionsAccessItem key={key} loading={loading} />
          ))}
        </div>
      )}
    </div>
  )
})
