import * as React from 'react'
import { Loader } from 'decentraland-ui'

import ItemDrawer from './ItemDrawer'
import { Props } from './SideBar.types'
import './SideBar.css'

export default class SideBar extends React.PureComponent<Props> {
  renderItemDrawer() {
    return <ItemDrawer categories={Object.values(this.props.categories!)} />
  }

  render() {
    const { categories, isLoading } = this.props

    return <div className="SideBar">{categories || !isLoading ? this.renderItemDrawer() : <Loader size="massive" />}</div>
  }
}
