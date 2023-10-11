import React from 'react'
import { UserInformation as BaseUserMenu } from 'decentraland-dapps/dist/containers'
import { Props } from './UserInformation.types'

const UserInformation = (props: Props) => {
  const { onClickActivity, onClickSettings, onSignIn, ...baseProps } = props

  return <BaseUserMenu {...baseProps} onClickActivity={onClickActivity} onClickSettings={onClickSettings} onSignIn={onSignIn} />
}

export default React.memo(UserInformation)
