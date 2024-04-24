import React from 'react'
import { AvatarFace } from 'decentraland-ui/dist/components/AvatarFace/AvatarFace'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import { getResumedAddress } from '../../utils'
import { WorldPermissionsAvatarWithInfoProps } from './WorldPermissionsAvatarWithInfo.types'

import styles from './WorldPermissionsAvatarWithInfo.module.css'

export default React.memo(function WorldPermissionsAvatarWithInfo(props: WorldPermissionsAvatarWithInfoProps) {
  const { wallet, profiles, loading } = props

  if (loading || !profiles || !wallet) {
    return (
      <div className={styles.avatar}>
        <AvatarFace size="small" inline />
        <LoadingText className={styles.loadingtext} type="p" size="medium"></LoadingText>
      </div>
    )
  }

  return (
    <div className={styles.avatar}>
      <AvatarFace className={styles.avatarface} avatar={profiles[wallet]} size="small" inline />
      <CopyToClipboard role="option" text={wallet} showPopup>
        <p className={styles.paragraph}>
          {profiles[wallet] && profiles[wallet].name && <span className={styles.span}>{profiles[wallet].name}</span>}
          {getResumedAddress(wallet)}{' '}
        </p>
      </CopyToClipboard>
    </div>
  )
})
