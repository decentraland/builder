import * as React from 'react'
import { Loader } from 'decentraland-ui'

import { Asset } from 'modules/asset/types'
import ItemDrawer from './ItemDrawer'
import { Props } from './SideBar.types'
import './SideBar.css'

export default class SideBar extends React.PureComponent<Props> {
  handleOnClick = (asset: Asset) => {
    this.props.onAddAsset(asset, this.getPosition())
  }

  getPosition() {
    // TODO: This is only for demostration purposes, we'll always add assets on the same position once we have a camera
    const x = Math.floor(Math.random() * 6) + 1
    const z = Math.floor(Math.random() * 6) + 1
    return { x, y: 0, z }
  }

  renderItemDrawer() {
    return <ItemDrawer categories={Object.values(this.props.categories!)} onClick={this.handleOnClick} />
  }

  render() {
    const { categories, isLoading } = this.props

    return <div className="SideBar">{categories || !isLoading ? this.renderItemDrawer() : <Loader size="massive" />}</div>
  }
}
