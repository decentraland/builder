import React from 'react'
import { Link } from 'react-router-dom'

import Banner from 'components/Banner'
import { locations } from '../../../routing/locations'
import './TopBanner.css'

export default class TopBanner extends React.PureComponent {
  render() {
    return (
      <Banner className="TopBanner" isClosable={false} name="auth0-migration-banner">
        <p>
          <span>
            The Builder has switched to wallet based account. Use the <Link to={locations.migrate()}>Migration Page</Link> to migrate your
            scenes.
          </span>
        </p>
      </Banner>
    )
  }
}
