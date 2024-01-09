import React from 'react'
import { Navbar2 as BaseNavbar2 } from 'decentraland-dapps/dist/containers'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers'
import { Navbar2Pages } from 'decentraland-ui/dist/components/Navbar2/Navbar2.types'
import UserInformation from 'components/UserInformation'
import { Props } from './Navbar.types'

import './Navbar.css'

const Navbar: React.FC<Props> = ({ hasPendingTransactions, isNavbarV2Enabled, ...props }: Props) => {
  return isNavbarV2Enabled ? (
    <BaseNavbar2 activePage={Navbar2Pages.CREATE} {...props} hasActivity={hasPendingTransactions} />
  ) : (
    <BaseNavbar activePage="builder" {...props} rightMenu={<UserInformation />} />
  )
}

export default React.memo(Navbar)
