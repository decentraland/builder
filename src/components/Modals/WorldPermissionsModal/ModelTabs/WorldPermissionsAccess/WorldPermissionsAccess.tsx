import React from 'react'

import classNames from 'classnames'
import { Checkbox } from 'decentraland-ui'

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
        title="Accessibility"
        description="In this sections you can update the access to your WORLD up to 100 addresses."
        loading={loading}
      />

      {!loading && (
        <div className="public-access-container">
          <span>
            {worldAccessPermissions?.type === WorldPermissionType.AllowList && `ALLOWED LIST ${worldAccessPermissions?.wallets.length}/100`}
          </span>
          <Checkbox
            toggle
            label={isAccessUnrestricted ? 'public' : 'private'}
            checked={isAccessUnrestricted}
            onChange={onChangeAccessPermission}
            aria-label={isAccessUnrestricted ? 'public' : 'private'}
          />
        </div>
      )}

      {!isAccessUnrestricted && (
        <WorldPermissionsAddUserForm
          showAddUserForm={showAddUserForm}
          newAddress={newAddress}
          isLoadingNewUser={isLoadingNewUser}
          addButtonLabel="Add Address"
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
