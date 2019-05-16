import React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Campaign } from 'modules/analytics/campaigns'

import { Props } from './PromoBanner.types'

import './PromoBanner.css'

export default class PromoBanner extends React.PureComponent<Props> {
  handleCTAClick = () => {
    const analytics = getAnalytics()
    analytics.track('HomePage Promo CTA', {
      campaign: Campaign.DAPPER
    })
    window.open('https://dap.pr/dclinstallp')
  }

  render() {
    return (
      <div className="PromoBanner">
        <div className="bg" />
        <div className="logo" />
        <div className="title">{t('banners.promo_title')}</div>
        <div className="subtitle">{t('banners.promo_subtitle')}</div>
        <Button className="cta" primary onClick={this.handleCTAClick}>
          {t('banners.promo_cta')}
        </Button>
      </div>
    )
  }
}
