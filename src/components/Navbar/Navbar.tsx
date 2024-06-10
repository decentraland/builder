import React, { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers/'
import { NavbarPages } from 'decentraland-ui/dist/components/Navbar/Navbar.types'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'
import { Props } from './Navbar.types'

import './Navbar.css'

const Navbar: React.FC<Props> = ({ hasPendingTransactions, address, ...props }: Props) => {
  const history = useHistory()
  const identity = useMemo(() => {
    if (address) {
      return localStorageGetIdentity(address)
    }
    return undefined
  }, [address])

  const onSignIn = () => {
    history.push(locations.signIn())
  }

  return (
    <BaseNavbar
      activePage={NavbarPages.CREATE}
      {...props}
      onSignIn={onSignIn}
      hasActivity={hasPendingTransactions}
      withNotifications
      identity={identity}
    />
  )
}

export default React.memo(Navbar)
