import * as React from 'react'
import { Responsive } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Campaign } from 'modules/analytics/campaigns'
import Banner from 'components/Banner'

import { Props } from './HomePageBanner.types'
import './HomePageBanner.css'

export default class HomePageBanner extends React.PureComponent<Props> {
  handleHomePageClick = () => {
    if (this.props.onClick) {
      this.props.onClick()
    }
  }

  handleMobilePageClick = () => {
    const analytics = getAnalytics()
    analytics.track('MobilePage CTA', {
      campaign: Campaign.DAPPER
    })
  }

  render() {
    const { className } = this.props

    let classes = 'HomePageBanner'

    if (className) {
      classes += ` ${className}`
    }

    return (
      <Banner className={classes} name="dapper-homepage-banner" isClosable>
        <div className="bg" />
        <div className="purple" />
        <div className="wrapper">
          <Responsive minWidth={1025} as={React.Fragment}>
            <div className="logo-left" />
          </Responsive>

          <Responsive minWidth={1025} as={React.Fragment}>
            <span className="text">
              <T
                id="banners.dapper_homepage"
                values={{
                  br: <br />,
                  cta: <a onClick={this.handleHomePageClick}>{t('banners.dapper_homepage_cta')}</a>
                }}
              />
            </span>
          </Responsive>

          <Responsive maxWidth={1024} as={React.Fragment}>
            <span className="text">
              <T
                id="banners.mobile_dapper_homepage"
                values={{
                  br: <br />,

                  cta: (
                    <a
                      href="https://decentraland.org/blog/picture-frames-dapper"
                      rel="noopener noreferrer"
                      target="_blank"
                      onClick={this.handleMobilePageClick}
                    >
                      {t('banners.mobile_dapper_hompage_cta')}
                    </a>
                  )
                }}
              />
            </span>
          </Responsive>

          <Responsive minWidth={1025} as={React.Fragment}>
            <div className="logo-right" />
          </Responsive>
        </div>
      </Banner>
    )
  }
}
