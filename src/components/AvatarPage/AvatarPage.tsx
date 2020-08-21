import * as React from 'react'
import { Page, Center, Loader } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import Navbar from 'components/Navbar'
import Navigation from 'components/Navigation'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import Footer from 'components/Footer'

import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Props } from './AvatarPage.types'
import './AvatarPage.css'

export default class AvatarPage extends React.PureComponent<Props> {
  renderLogin() {
    return (
      <Center className="login-wrapper">
        <div className="secondary-text">
          <T id="land_page.sign_in" values={{ link: <Link to={locations.signIn()}>{t('land_page.sign_in_link')}</Link> }} />
        </div>
      </Center>
    )
  }

  renderLoading() {
    return <Loader size="large" active />
  }

  renderPage() {
    const { items, collections } = this.props
    return (
      <p>
        There are {items.length} items and {collections.length} collections
      </p>
    )
  }

  render() {
    const { isLoggedIn, isLoading } = this.props
    return (
      <>
        <Navbar isFullscreen />
        <Navigation activeTab={NavigationTab.AVATAR} />
        <Page className="AvatarPage">
          {!isLoggedIn ? this.renderLogin() : null}
          {isLoggedIn && isLoading ? this.renderLoading() : null}
          {isLoggedIn && !isLoading ? this.renderPage() : null}
        </Page>
        <Footer />
      </>
    )
  }
}
