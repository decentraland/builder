import React from 'react'
import { Link } from 'react-router-dom'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

import Banner from 'components/Banner'
import { locations } from '../../../routing/locations'
import './TopBanner.css'

export default class TopBanner extends React.PureComponent {
  render() {
    return (
      <Banner className="TopBanner" isClosable={false} name="auth0-migration-banner">
        <p>
          <span>
            <T
              id="home_page.migration_banner"
              values={{
                link: <Link to={locations.migrate()}>{t('home_page.migration_banner_link')}</Link>
              }}
            />
          </span>
        </p>
      </Banner>
    )
  }
}
