import React from 'react'
import { AvatarFace } from 'decentraland-ui/dist/components/AvatarFace/AvatarFace'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import { getResumedAddress } from '../../../utils'
import { Props } from './WorldPermissionsAvatarWithInfo.types'

import styles from './WorldPermissionsAvatarWithInfo.module.css'

export const WORLD_PERMISSIONS_AVATAR_WITH_INFO_LOADING_TEST_ID = 'world-permissions-avatar-with-info-loading-test-id'
export const WORLD_PERMISSIONS_AVATAR_WITH_INFO_WALLET_TEST_ID = 'world-permissions-avatar-with-info-wallet-test-id'
export const WORLD_PERMISSIONS_AVATAR_WITH_INFO_NAME_TEST_ID = 'world-permissions-avatar-with-info-name-test-id'
export const WORLD_PERMISSIONS_AVATAR_WITH_INFO_AVATAR_TEST_ID = 'world-permissions-avatar-with-info-avatar-test-id'

export const WorldPermissionsAvatarWithInfo = React.memo((props: Props) => {
  const { walletAddress, profileAvatar, isLoading } = props

  if (isLoading) {
    return (
      <div className={styles.avatar} data-testid={WORLD_PERMISSIONS_AVATAR_WITH_INFO_LOADING_TEST_ID}>
        <AvatarFace size="small" inline />
        <LoadingText className={styles.loadingText} type="p" size="medium"></LoadingText>
      </div>
    )
  }

  return (
    <div className={styles.avatar} data-testid={WORLD_PERMISSIONS_AVATAR_WITH_INFO_AVATAR_TEST_ID}>
      <AvatarFace className={styles.avatarface} avatar={profileAvatar} size="small" inline />
      <CopyToClipboard role="option" text={walletAddress} showPopup>
        <p className={styles.paragraph} data-testid={WORLD_PERMISSIONS_AVATAR_WITH_INFO_WALLET_TEST_ID}>
          {profileAvatar && profileAvatar.name && (
            <span className={styles.span} data-testid={WORLD_PERMISSIONS_AVATAR_WITH_INFO_NAME_TEST_ID}>
              {profileAvatar.name}
            </span>
          )}
          {getResumedAddress(walletAddress)}{' '}
        </p>
      </CopyToClipboard>
    </div>
  )
})
