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
      <Banner className={classes} name="builder-contest-end" isClosable>
        <div className="orange" />
        <div className="purple" />
        <span className="text">
          <T
            id="banners.contest_end"
            values={{
              read_more: <a href="https://decentraland.org/blog/announcements/the-creator-contest-has-ended/">{t('global.read_more')}</a>
            }}
          />
        </span>
      </Banner>
    )
  }
}
