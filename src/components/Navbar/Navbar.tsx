import React, { useMemo } from 'react'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers/'
import { NavbarPages } from 'decentraland-ui/dist/components/Navbar/Navbar.types'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'
import { Props } from './Navbar.types'

import './Navbar.css'

const Navbar: React.FC<Props> = ({ hasPendingTransactions, address, ...props }: Props) => {
  const identity = useMemo(() => {
    if (address) {
      return localStorageGetIdentity(address)
    }
    return undefined
  }, [address])
  return (
    <BaseNavbar activePage={NavbarPages.CREATE} {...props} hasActivity={hasPendingTransactions} withNotifications identity={identity} />
  )
}

export default React.memo(Navbar)
