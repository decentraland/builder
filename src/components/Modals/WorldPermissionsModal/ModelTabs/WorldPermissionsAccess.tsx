import React from 'react'

import { Checkbox, Button, Icon as DCLIcon, Field } from 'decentraland-ui'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'

import { WorldPermissionNames, WorldPermissionType } from 'lib/api/worlds'
import { WorldPermissionsAccessProps } from './WorldPermissionsAccess.types'

import './WorldPermissionsAccess.css'
import classNames from 'classnames'
import WorldPermissionsAccessItem from './WorldPermissionsAccessItem'

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
      {loading && <LoadingText type="h1" size="small"></LoadingText>}
      {!loading && <h1>Accessibility</h1>}
      {loading && <LoadingText type="p" size="full"></LoadingText>}
      {!loading && <p>In this sections you can update the access to your WORLD up to 100 addresses.</p>}
      {loading && <LoadingText type="p" size="full"></LoadingText>}
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
        <div className="tab-content__add-user-wrapper">
          {!showAddUserForm && (
            <div className="tab-content__add-user-button-container">
              <Button onClick={onShowAddUserForm}>
                <DCLIcon name="plus" />
                Add Address
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
                error={error}
                message={error ? 'invalid address' : ''}
              />
              <Button
                onClick={e =>
                  newAddress === ''
                    ? onShowAddUserForm(e, {})
                    : onUserPermissionListChange(e, { wallet: newAddress, worldPermissionName: WorldPermissionNames.Access })
                }
                loading={isLoadingNewUser}
                disabled={isLoadingNewUser}
              >
                {newAddress === '' ? 'Cancel' : 'Add'}
              </Button>
            </div>
          )}
        </div>
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
