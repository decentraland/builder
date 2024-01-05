import * as React from 'react'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers'
import UserInformation from 'components/UserInformation'
import { Props } from './Navbar.types'

export default class Navbar extends React.PureComponent<Props> {
  render() {
    return <BaseNavbar activePage="builder" {...this.props} rightMenu={<UserInformation />} />
  }
}
