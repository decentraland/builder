import * as React from 'react'
import { Page, Center, Loader, Container, Row, Column, Header, Card } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'

import { locations } from 'routing/locations'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import Navigation from 'components/Navigation'
import Navbar from 'components/Navbar'
import ItemCard from 'components/ItemCard'
import CollectionCard from 'components/CollectionCard'
import Footer from 'components/Footer'
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
    const count = items.length + collections.length
    return (
      <>
        <div className="filters">
          <Container>
            <Row height={30}>
              <Column>
                <Row>
                  <Header sub>{t('avatar_page.results', { count })}</Header>
                </Row>
              </Column>
              <Column align="right">
                <Row>Some filters here</Row>
              </Column>
            </Row>
          </Container>
        </div>

        <Card.Group>
          {items
            .filter(item => item.collectionId === undefined)
            .map((item, index) => (
              <ItemCard key={index} item={item} />
            ))}
          {collections.map((collection, index) => (
            <CollectionCard key={index} collection={collection} />
          ))}
        </Card.Group>
      </>
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
