import * as React from 'react'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers'
import UserInformation from 'components/UserInformation'
import UserMenu from 'components/UserMenu'
import { Props } from './Navbar.types'

export default class Navbar extends React.PureComponent<Props> {
  render() {
    let props = this.props

    if (props.isConnected) {
      props = { ...props, rightMenu: <UserMenu /> }
    }
    if (props.isNewNavbarEnabled) {
      props = { ...props, rightMenu: <UserInformation /> }
    }
    return <BaseNavbar activePage="builder" {...props} />
  }
}
