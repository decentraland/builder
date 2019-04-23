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
      <Banner className={classes} name="builder-contest-winners" isClosable>
        <div className="orange" />
        <div className="purple" />
        <span className="text">
          <T
            id="banners.contest_winners"
            values={{
              link: (
                <a href={t('banners.contest_winners_link')} rel="noopener noreferrer" target="_blank">
                  {t('global.here')}
                </a>
              )
            }}
          />
        </span>
      </Banner>
    )
  }
}
