import React from 'react'
import { UserInformation as BaseUserMenu } from 'decentraland-dapps/dist/containers'
import { Props } from './UserInformation.types'

const UserInformation = (props: Props) => {
  const { onClickMyAssets, onClickSettings, ...baseProps } = props

  return <BaseUserMenu {...baseProps} onClickMyAssets={onClickMyAssets} onClickSettings={onClickSettings} />
}

export default React.memo(UserInformation)
