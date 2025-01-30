import React, { useCallback, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'
import { Button, Card, Container, Page } from 'decentraland-ui'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { Banner } from 'decentraland-dapps/dist/containers/Banner'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import LoadingPage from 'components/LoadingPage'
import SyncToast from 'components/SyncToast'
import Navigation from 'components/Navigation'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { BUILDER_BANNER_ID } from 'modules/common/banners'
import { locations } from 'routing/locations'
import { Props } from './HomePage.types'
import './HomePage.css'

export const LOCALSTORAGE_LAST_VISITED_SECTION_KEY = 'builder-last-visited-section'
const localStorage = getLocalStorage()
const cards = [NavigationTab.COLLECTIONS, NavigationTab.SCENES, NavigationTab.LAND, NavigationTab.NAMES]

export const HomePage: React.FC<Props> = props => {
  const { isLoggingIn, isLoggedIn } = props
  const history = useHistory()

  useEffect(() => {
    const lastVisitedSection = localStorage.getItem(LOCALSTORAGE_LAST_VISITED_SECTION_KEY) ?? ''
    if (isLoggedIn && !history.length && lastVisitedSection !== locations.root()) {
      history.push(lastVisitedSection)
    }
  }, [isLoggedIn, history])

  const handleOnNavigate = useCallback(
    (path: string) => {
      localStorage.setItem(LOCALSTORAGE_LAST_VISITED_SECTION_KEY, path)
      history.push(path)
    },
    [history]
  )

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
        return 'https://docs.decentraland.org/creator/editor/about-scene-editor/'
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
      <Navbar />
      <Page isFullscreen className="HomePage">
        <Navigation activeTab={NavigationTab.OVERVIEW}>
          <SyncToast />
        </Navigation>
        <Banner id={BUILDER_BANNER_ID} />
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
