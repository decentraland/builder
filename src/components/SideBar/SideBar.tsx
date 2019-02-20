import * as React from 'react'

import { Asset } from 'modules/asset/types'
import ItemDrawer from './ItemDrawer'
import { Props } from './SideBar.types'
import './SideBar.css'

export default class SideBar extends React.PureComponent<Props> {
  handleOnClick = (asset: Asset) => {
    this.props.onAddItem(asset)
  }

  renderItemDrawer() {
    const { categories, onSearch } = this.props
    return <ItemDrawer categories={Object.values(categories!)} onClick={this.handleOnClick} onSearch={onSearch} />
  }

  render() {
    const { isLoading, categories } = this.props
    return (
      <div className={'SideBar ' + (isLoading ? 'loading' : '')}>
        {!categories || isLoading ? <div className="spinner" /> : this.renderItemDrawer()}
      </div>
    )
  }
}
