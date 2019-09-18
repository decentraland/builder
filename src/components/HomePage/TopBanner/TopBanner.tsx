import React from 'react'
import Banner from 'components/Banner'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import "./TopBanner.css"

export default class TopBanner extends React.PureComponent {

  render() {
    return <Banner className="TopBanner" isClosable={true} name="dcl-top-banner">
      <p>
      <span>{t('banners.top_banner_left')}</span>
      <a href="https://hack.decentraland.org/">{' '}{t('banners.top_banner_action')}{' '}</a>
      <span>{t('banners.top_banner_right')}</span>
      </p>
    </Banner>
  }
}
