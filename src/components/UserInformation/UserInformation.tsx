import React, { useCallback } from 'react'
import { redirectToAuthDapp } from 'routing/locations'
import { UserInformation as BaseUserMenu } from 'decentraland-dapps/dist/containers'
import { Props } from './UserInformation.types'

const UserInformation = (props: Props) => {
  const { isAuthDappEnabled, onClickActivity, onClickSettings, onSignIn, ...baseProps } = props

  const handleSignIn = useCallback(() => {
    if (isAuthDappEnabled) {
      redirectToAuthDapp()
    } else if (onSignIn) {
      onSignIn()
    }
  }, [isAuthDappEnabled, onSignIn])

  return <BaseUserMenu {...baseProps} onClickActivity={onClickActivity} onClickSettings={onClickSettings} onSignIn={handleSignIn} />
}

export default React.memo(UserInformation)
