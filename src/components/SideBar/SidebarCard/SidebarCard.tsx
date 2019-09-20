import * as React from 'react'
import { Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Icon from 'components/Icon'
import { Props } from './SidebarCard.types'
import './SidebarCard.css'

export default class SidebarCard extends React.PureComponent<Props> {
  handleClick = () => {
    const { id, onClick } = this.props
    onClick(id)
  }

  render() {
    const { title, thumbnail, isVisible, isNew } = this.props

    if (!isVisible) return null

    return (
      <div className="SidebarCard" onClick={this.handleClick}>
        {isNew ? <div className="new-badge">{t('global.new')}</div> : null}
        <img className="thumbnail" src={thumbnail} alt="" />
        <Header size="small" className="title">
          {title}
        </Header>
        <Icon name="chevron-right" />
      </div>
    )
  }
}
