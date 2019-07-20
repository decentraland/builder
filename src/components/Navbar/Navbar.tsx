import * as React from 'react'
import { Navbar as DappsNavbar } from 'decentraland-dapps/dist/containers'
import UserMenu from 'components/UserMenu'
import { NavbarProps } from 'decentraland-ui'

export default class Navbar extends React.PureComponent<NavbarProps> {
  render() {
    return <DappsNavbar activePage="builder" rightMenu={<UserMenu />} {...this.props} />
  }
}
