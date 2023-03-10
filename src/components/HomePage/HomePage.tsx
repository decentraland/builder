import React, { useEffect } from 'react'
import classNames from 'classnames'
import { Button, Card, Container, Page } from 'decentraland-ui'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import LoadingPage from 'components/LoadingPage'
import SyncToast from 'components/SyncToast'
import Navigation from 'components/Navigation'
import EventBannerContainer from 'components/EventBanner/EventBanner.container'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { locations } from 'routing/locations'
import { Props } from './HomePage.types'
import './HomePage.css'

export const LOCALSTORAGE_LAST_VISITED_SECTION_KEY = 'builder-last-visited-section'

const localStorage = getLocalStorage()
const cards = [NavigationTab.COLLECTIONS, NavigationTab.SCENES, NavigationTab.LAND, NavigationTab.NAMES]

export const HomePage: React.FC<Props> = props => {
  const { isLoggingIn, isLoggedIn, hasRouterHistory, onNavigate } = props

  useEffect(() => {
    const lastVisitedSection = localStorage.getItem(LOCALSTORAGE_LAST_VISITED_SECTION_KEY) ?? ''
    if (isLoggedIn && !hasRouterHistory && lastVisitedSection !== locations.root()) {
      onNavigate(lastVisitedSection)
    }
  }, [isLoggedIn, hasRouterHistory, onNavigate])

  const handleOnNavigate = (path: string) => {
    localStorage.setItem(LOCALSTORAGE_LAST_VISITED_SECTION_KEY, path)
    onNavigate(path)
  }

  const handleOnClickCardCTA = (tab: NavigationTab) => {
    switch (tab) {
      case NavigationTab.COLLECTIONS:
        return handleOnNavigate(locations.collections())
      case NavigationTab.SCENES:
        return handleOnNavigate(locations.scenes())
      case NavigationTab.LAND:
        return handleOnNavigate(locations.land())
      case NavigationTab.NAMES:
        return handleOnNavigate(locations.ens())
      default:
        throw new Error('Invalid NavigationTab')
    }
  }

  const getLearnMoreLink = (card: string): string => {
    switch (card) {
      case NavigationTab.COLLECTIONS:
        return 'https://docs.decentraland.org/creator/wearables/wearables-overview/#collections'
      case NavigationTab.SCENES:
        return 'https://docs.decentraland.org/creator/builder/builder-101/#scenes'
      case NavigationTab.LAND:
        return 'https://docs.decentraland.org/player/market/land-manager/'
      case NavigationTab.NAMES:
        return 'https://decentraland.org/blog/project-updates/manage-names-in-the-builder/'
      default:
        throw new Error('Invalid Navigation Tab')
    }
  }

  if (isLoggingIn) {
    return <LoadingPage />
  }

  return (
    <>
      <Navbar isFullscreen />
      <Page isFullscreen className="HomePage">
        <Navigation activeTab={NavigationTab.OVERVIEW}>
          <SyncToast />
        </Navigation>
        <EventBannerContainer />
        <Container>
          <h1 className="title">{t('home_page.title')}</h1>
          <Card.Group itemsPerRow={4} centered>
            {cards.map((card, index) => (
              <Card key={index}>
                <Card.Content textAlign="center">
                  <Card.Header>{t(`home_page.${card}.card_title`)}</Card.Header>
                  <Card.Description>
                    <p className="card-description">{t(`home_page.${card}.card_description`)}</p>
                    <div className={classNames('card-image', card)}></div>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Button primary content={t(`home_page.${card}.cta_label`)} onClick={() => handleOnClickCardCTA(card)} />
                  <Button
                    as="a"
                    basic
                    content={t('global.learn_more')}
                    href={getLearnMoreLink(card)}
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </Container>
      </Page>
      <Footer />
    </>
  )
}

export default HomePage
