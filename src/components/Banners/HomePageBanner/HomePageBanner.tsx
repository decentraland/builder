import * as React from 'react'

import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import Banner from 'components/Banner'

import { Props } from './HomePageBanner.types'
import './HomePageBanner.css'

export default class HomePageBanner extends React.PureComponent<Props> {
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
        <span className="text">
          <T
            id="banners.dapper_homepage"
            values={{
              br: <br />,
              cta: (
                <a href="https://dap.pr/dclinstallp" rel="noopener noreferrer" target="_blank">
                  {t('banners.dapper_homepage_cta')}
                </a>
              )
            }}
          />
        </span>
      </Banner>
    )
  }
}
