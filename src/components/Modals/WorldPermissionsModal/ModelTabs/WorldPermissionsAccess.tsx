import React from 'react'

import { Checkbox, Button, Icon as DCLIcon, Field, AvatarFace } from 'decentraland-ui'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'

import Icon from 'components/Icon'
import { WorldPermissionNames, WorldPermissionType } from 'lib/api/worlds'
import { WorldPermissionsAccessProps } from './WorldPermissionsAccess.types'

const getResumedAddress = (address: string) => address.substring(0, 6) + '...' + address.substring(address.length - 6)

export default React.memo(function WorldPermissionsAccess(props: WorldPermissionsAccessProps) {
  const {
    loading,
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
    <div className="world-permissions__tab-access">
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
              type="address"
              error={error}
              message={error && 'invalid address'}
            />
            <Button onClick={e => onUserPermissionListChange(e, { wallet: newAddress, worldPermissionName: WorldPermissionNames.Access })}>
              {newAddress === '' ? 'Cancel' : 'Add'}
            </Button>
          </div>
        )}
      </div>

      <div className="access-list">
        {worldAccessPermissions?.type === WorldPermissionType.AllowList &&
          worldAccessPermissions.wallets?.map((wallet, index) => {
            const address = wallet.toLowerCase()
            return (
              <div className="access-list__item" key={index}>
                <div className="access-list__user" key={index}>
                  <AvatarFace avatar={profiles[address]} size="small" inline />
                  <p>
                    {profiles[address] && profiles[address].hasClaimedName && <span>{profiles[address].name}</span>}
                    {getResumedAddress(address)}{' '}
                  </p>
                </div>
                <Button
                  basic
                  onClick={e =>
                    onUserPermissionListChange(e as React.MouseEvent, { wallet: address, worldPermissionName: WorldPermissionNames.Access })
                  }
                >
                  <Icon name="close" />
                </Button>
              </div>
            )
          })}
      </div>
    </div>
  )
})
