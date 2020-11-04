import * as React from 'react'

import ItemDrawer from './ItemDrawer'
import { Props } from './SideBar.types'
import EntityEditor from './EntityEditor'
import './SideBar.css'

export default class SideBar extends React.PureComponent<Props> {
  renderView = () => {
    const { isLoading, categories, hasScript } = this.props

    if (hasScript) {
      return <EntityEditor />
    } else if (categories && !isLoading) {
      return <ItemDrawer />
    }
    return <div className="spinner" />
  }

  render() {
    const { isLoading } = this.props
    return <div className={'SideBar ' + (isLoading ? 'loading' : '')}>{this.renderView()}</div>
  }
}
