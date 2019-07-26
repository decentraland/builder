import * as React from 'react'
import { NavbarProps } from 'decentraland-ui'
import { Navbar as DappsNavbar } from 'decentraland-dapps/dist/containers'
import UserMenu from 'components/UserMenu'

export default class Navbar extends React.PureComponent<NavbarProps> {
  render() {
    return <DappsNavbar activePage="builder" rightMenu={<UserMenu />} {...this.props} />
  }
}
