import React, { useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar2 as BaseNavbar } from 'decentraland-dapps/dist/containers/Navbar'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'
import { config } from 'config/index'
import { Props } from './Navbar.types'

const Navbar: React.FC<Props> = ({ address, ...props }: Props) => {
  const { pathname, search } = useLocation()

  const identity = useMemo(() => {
    if (address) {
      return localStorageGetIdentity(address) ?? undefined
    }
    return undefined
  }, [address])

  const handleOnSignIn = useCallback(() => {
    const searchParams = new URLSearchParams(search)
    const currentRedirectTo = searchParams.get('redirectTo')
    const basename = /^decentraland.(zone|org|today)$/.test(window.location.host) ? '/builder' : ''
    const redirectTo = !currentRedirectTo ? `${basename}${pathname}${search}` : `${basename}${currentRedirectTo}`

    window.location.replace(`${config.get('AUTH_URL')}/login?redirectTo=${redirectTo}`)
  }, [])

  return (
    <div style={{ marginBottom: 36 }}>
      <BaseNavbar
        {...props}
        withChainSelector
        withNotifications
        withCredits={false}
        activePage="create"
        identity={identity}
        onSignIn={handleOnSignIn}
      />
    </div>
  )
}

export default React.memo(Navbar)
