import React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './PromoBanner.types'

import './PromoBanner.css'

export default class PromoBanner extends React.PureComponent<Props> {
  render() {
    return (
      <div className="PromoBanner">
        <div className="bg" />
        <div className="logo" />
        <div className="title">{t('banners.promo_title')}</div>
        <div className="subtitle">{t('banners.promo_subtitle')}</div>
        <Button
          className="cta"
          href="https://www.meetdapper.com/?utm_source=decentraland"
          target="_blank"
          rel="noopener noreferrer"
          primary
        >
          {t('banners.promo_cta')}
        </Button>
      </div>
    )
  }
}
