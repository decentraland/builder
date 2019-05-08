import * as React from 'react'
import { Header } from 'decentraland-ui'

import Icon from 'components/Icon'
import { Props } from './SidebarCard.types'
import './SidebarCard.css'

export default class SidebarCard extends React.PureComponent<Props> {
  handleClick = () => {
    const { id, onClick } = this.props
    onClick(id)
  }

  render() {
    const { title, thumbnail, isVisible } = this.props

    if (!isVisible) return null

    return (
      <div className="SidebarCard" onClick={this.handleClick}>
        <img className="thumbnail" src={thumbnail} alt="" />
        <Header size="small" className="title">
          {title}
        </Header>
        <Icon name="chevron-right" />
      </div>
    )
  }
}
