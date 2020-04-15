import * as React from 'react'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers'
import UserMenu from 'components/UserMenu'
import { Props } from './Navbar.types'

export default class Navbar extends React.PureComponent<Props> {
  render() {
    let props = this.props
    if (props.isConnected) {
      props = { ...props, rightMenu: <UserMenu /> }
    }
    return <BaseNavbar activePage="builder" {...props} />
  }
}
