import * as React from 'react'

import ItemDrawer from './ItemDrawer'
import { Props } from './SideBar.types'
import './SideBar.css'

export default class SideBar extends React.PureComponent<Props> {
  render() {
    const { isLoading, categories } = this.props
    return (
      <div className={'SideBar ' + (isLoading ? 'loading' : '')}>
        {!categories || isLoading ? <div className="spinner" /> : <ItemDrawer />}
      </div>
    )
  }
}
