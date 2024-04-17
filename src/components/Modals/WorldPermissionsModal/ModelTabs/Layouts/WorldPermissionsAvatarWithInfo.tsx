import React from 'react'
import { AvatarFace } from 'decentraland-ui/dist/components/AvatarFace/AvatarFace'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import { getResumedAddress } from '../../utils'
import { WorldPermissionsAvatarWithInfoProps } from './WorldPermissionsAvatarWithInfo.types'

import './WorldPermissionsAvatarWithInfo.css'

export default React.memo(function WorldPermissionsAvatarWithInfo(props: WorldPermissionsAvatarWithInfoProps) {
  const { wallet, profiles, loading } = props

  if (loading || !profiles || !wallet) {
    return (
      <div className="world-permission-avatar">
        <AvatarFace size="small" inline />
        <LoadingText type="p" size="medium"></LoadingText>
      </div>
    )
  }

  return (
    <div className="world-permission-avatar">
      <AvatarFace avatar={profiles[wallet]} size="small" inline />
      <CopyToClipboard role="option" text={wallet}>
        <p>
          {profiles[wallet] && profiles[wallet].name && <span>{profiles[wallet].name}</span>}
          {profiles[wallet] && !profiles[wallet].hasClaimedName && <sup>NO NAME</sup>}
          {getResumedAddress(wallet)}{' '}
        </p>
      </CopyToClipboard>
    </div>
  )
})
