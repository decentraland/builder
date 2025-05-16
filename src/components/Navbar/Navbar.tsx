import React, { useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar2 as BaseNavbar } from 'decentraland-dapps/dist/containers/Navbar'
import { NavbarPages } from 'decentraland-ui/dist/components/Navbar/Navbar.types'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'
import { config } from 'config/index'
import { Props } from './Navbar.types'

import './Navbar.css'

const Navbar: React.FC<Props> = ({ hasPendingTransactions, address, ...props }: Props) => {
  const { pathname, search } = useLocation()

  const identity = useMemo(() => {
    if (address) {
      return localStorageGetIdentity(address)
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
    <BaseNavbar
      {...props}
      withNotifications
      activePage={NavbarPages.CREATE}
      hasActivity={hasPendingTransactions}
      identity={identity}
      onSignIn={handleOnSignIn}
    />
  )
}

export default React.memo(Navbar)
