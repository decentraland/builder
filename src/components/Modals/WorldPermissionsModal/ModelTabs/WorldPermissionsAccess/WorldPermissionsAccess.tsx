import React from 'react'

import classNames from 'classnames'
import { Checkbox, Icon } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

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
        description={
          <T
            id="world_permissions_modal.tab_access.description"
            values={{
              br: () => <br />,
              span: (text: string) => <span>{text}</span>
            }}
          />
        }
        loading={loading}
      />

      {!loading && !isAccessUnrestricted && (
        <div className="access-warning-container">
          <Icon name="exclamation triangle" />
          <p>
            <T
              id="world_permissions_modal.tab_access.warning"
              values={{
                b: (text: string) => <span>{text}</span>
              }}
            />
          </p>
        </div>
      )}

      {!loading && (
        <div className="public-access-container">
          <div>
            <span>{t('world_permissions_modal.tab_access.private')}</span>
            <Checkbox
              toggle
              label={t('world_permissions_modal.tab_access.public')}
              checked={isAccessUnrestricted}
              onChange={onChangeAccessPermission}
              aria-label={t('world_permissions_modal.tab_access.public')}
            />
          </div>
          <span>
            {worldAccessPermissions?.type === WorldPermissionType.AllowList &&
              t('world_permissions_modal.tab_access.approved_addresses', { number: `${worldAccessPermissions?.wallets.length}/100` })}
          </span>
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
                />
              )
            })}
          {worldAccessPermissions?.type === WorldPermissionType.AllowList &&
            !isLoadingNewUser &&
            worldAccessPermissions.wallets.length === 0 && (
              <div className="world-permissions__empty-list">
                <T id="world_permissions_modal.tab_access.empty_list" />
              </div>
            )}
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
