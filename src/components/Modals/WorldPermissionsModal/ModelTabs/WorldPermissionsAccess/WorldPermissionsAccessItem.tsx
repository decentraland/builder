import React from 'react'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { WorldPermissionNames } from 'lib/api/worlds'
import Icon from 'components/Icon'
import { WorldPermissionsAccessItemProps } from './WorldPermissionsAccessItem.types'
import { WorldPermissionsAvatarWithInfo } from '../Layouts/WorldPermissionsAvatarWithInfo'

import styles from './WorldPermissionsAccessItem.module.css'

export default React.memo(function WorldPermissionsAccessItem(props: WorldPermissionsAccessItemProps) {
  const { address, onUserPermissionListChange, loading } = props

  if (loading || !address || !onUserPermissionListChange) {
    return (
      <div className={styles.listItem}>
        <WorldPermissionsAvatarWithInfo isLoading walletAddress="" />
        <Button basic loading />
      </div>
    )
  }

  return (
    <div className={styles.listItem}>
      <WorldPermissionsAvatarWithInfo walletAddress={address} />
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
