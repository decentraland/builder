import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './PromoBanner.types'

import './PromoBanner.css'

export default class PromoBanner extends React.PureComponent<Props> {
  handleCTAClick = () => {
    this.props.onClick()
  }

  render() {
    return (
      <div className="PromoBanner" onClick={this.handleCTAClick}>
        <div className="title">{t('banners.promo_title')}</div>
        <div className="subtitle">{t('banners.promo_subtitle')}</div>
        <div className="promo-image" />
      </div>
    )
  }
}
