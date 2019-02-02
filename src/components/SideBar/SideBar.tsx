import * as React from 'react'
import { Loader } from 'decentraland-ui'

import { Asset } from 'modules/asset/types'
import { getRandomPosition } from 'modules/scene/utils'
import ItemDrawer from './ItemDrawer'
import { Props } from './SideBar.types'
import './SideBar.css'

export default class SideBar extends React.PureComponent<Props> {
  handleOnClick = (asset: Asset) => {
    // TODO: Using getPosition here is for demostration purposes, we'll always add assets on the same position once we have a camera
    this.props.onAddItem(asset, getRandomPosition())
  }

  renderItemDrawer() {
    const { categories, onSearch } = this.props
    return <ItemDrawer categories={Object.values(categories!)} onClick={this.handleOnClick} onSearch={onSearch} />
  }

  render() {
    const { categories, isLoading } = this.props

    return <div className="SideBar">{categories || !isLoading ? this.renderItemDrawer() : <Loader size="massive" />}</div>
  }
}
