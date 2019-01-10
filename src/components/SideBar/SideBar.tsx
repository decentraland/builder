import * as React from 'react'
import './SideBar.css'

import ItemDrawer from './ItemDrawer'
import { Props } from './SideBar.types'

export default class SideBar extends React.PureComponent<Props> {
  render() {
    const { assets } = this.props
    return <div className="SideBar">{assets ? <ItemDrawer assets={Object.values(assets)} /> : null}</div>
  }
}
