import React from 'react'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers/'
import { NavbarPages } from 'decentraland-ui/dist/components/Navbar/Navbar.types'
import { Props } from './Navbar.types'

import './Navbar.css'

const Navbar: React.FC<Props> = ({ hasPendingTransactions, isNavbarV2Enabled, ...props }: Props) => {
  return (
    <BaseNavbar activePage={NavbarPages.CREATE} {...props} hasActivity={hasPendingTransactions} />
  )
}

export default React.memo(Navbar)
