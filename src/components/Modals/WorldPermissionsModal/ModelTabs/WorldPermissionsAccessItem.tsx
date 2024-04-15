import React from 'react'
import { AvatarFace } from 'decentraland-ui/dist/components/AvatarFace/AvatarFace'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { WorldPermissionNames } from 'lib/api/worlds'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import Icon from 'components/Icon'
import { getResumedAddress } from '../utils'
import { WorldPermissionsAccessItemProps } from './WorldPermissionsAccessItem.types'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'

import './WorldPermissionsAccess.css'

export default React.memo(function WorldPermissionsAccessItem(props: WorldPermissionsAccessItemProps) {
  const { address, profiles, onUserPermissionListChange, loading } = props

  if (loading || !profiles || !address || !onUserPermissionListChange) {
    return (
      <div className="access-list__item">
        <div className="access-list__user">
          <AvatarFace size="small" inline />
          <LoadingText type="p" size="medium"></LoadingText>
        </div>
        <Button basic loading />
      </div>
    )
  }

  return (
    <div className="access-list__item">
      <div className="access-list__user">
        <AvatarFace avatar={profiles[address]} size="small" inline />
        <CopyToClipboard role="option" text={address}>
          <p>
            {profiles[address] && profiles[address].name && <span>{profiles[address].name}</span>}
            {profiles[address] && !profiles[address].hasClaimedName && <sup>NO NAME</sup>}
            {getResumedAddress(address)}{' '}
          </p>
        </CopyToClipboard>
      </div>
      <Button
        basic
        onClick={e =>
          onUserPermissionListChange(e as React.MouseEvent, {
            wallet: address.toLowerCase(),
            worldPermissionName: WorldPermissionNames.Access
          })
        }
      >
        <Icon name="close" />
      </Button>
    </div>
  )
})
