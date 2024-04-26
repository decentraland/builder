import React from 'react'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { WorldPermissionNames } from 'lib/api/worlds'
import Icon from 'components/Icon'
import { WorldPermissionsAvatarWithInfo } from '../../Layouts/WorldPermissionsAvatarWithInfo'
import { Props } from './WorldPermissionsAccessItem.types'
import styles from './WorldPermissionsAccessItem.module.css'

export const WORLD_PERMISSIONS_ACCESS_ITEM_BUTTON_DATA_TEST_ID = 'world-permissions-access-item-button-data-test-id'

export const WorldPermissionsAccessItem = React.memo((props: Props) => {
  const { walletAddress, onUserPermissionListChange, loading } = props

  return (
    <div className={styles.listItem}>
      <WorldPermissionsAvatarWithInfo isLoading={loading} walletAddress={walletAddress ?? ''} />
      <Button
        basic
        data-testid={WORLD_PERMISSIONS_ACCESS_ITEM_BUTTON_DATA_TEST_ID}
        loading={loading}
        disabled={loading}
        onClick={e =>
          walletAddress &&
          onUserPermissionListChange(e as React.MouseEvent, {
            walletAddress: walletAddress.toLowerCase(),
            worldPermissionName: WorldPermissionNames.Access
          })
        }
      >
        <Icon name="close" />
      </Button>
    </div>
  )
})
