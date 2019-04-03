import * as React from 'react'
import { Button, Hero, Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import HomePageBanner from 'components/Banners/HomePageBanner'
import MobilePageHero from 'components/MobilePageHero/MobilePageHero'
import { api, EMAIL_INTEREST } from 'lib/api'

import { Props, State } from './MobilePage.types'
import './MobilePage.css'

const localStorage = getLocalStorage()

export default class MobilePage extends React.PureComponent<Props, State> {
  state = {
    email: '',
    isLoading: false
  }

  componentDidMount() {
    document.body.classList.add('mobile-body')
  }

  componentWillUnmount() {
    document.body.classList.remove('mobile-body')
  }

  handleEmailChange = (event: React.FormEvent<HTMLInputElement>) => {
    const email = event.currentTarget.value
    this.setState({ email })
  }

  handleSecondaryAction = () => {
    window.open(`mailto:?subject=${t('mobile_page.reminder_subject')}&body=${encodeURIComponent(t('mobile_page.reminder_body'))}`)
  }

  handleOpenVideo = () => window.open('https://youtu.be/H8Fj72JobKo')

  handleSubmit = () => {
    const { email } = this.state
    const analytics = getAnalytics()

    this.setState({ isLoading: true })

    analytics.identify({ email }, () => {
      api.reportEmail(email, EMAIL_INTEREST.MOBILE).catch(() => console.error('Unable to submit email, something went wrong!'))
      localStorage.setItem('mobile-email', email)
      this.setState({ isLoading: false })
    })
  }

  render() {
    const { email, isLoading } = this.state
    const hasMobileEmail = !!localStorage.getItem('mobile-email')

    return (
      <div className="MobilePage">
        <MobilePageHero
          email={email}
          hasMobileEmail={hasMobileEmail}
          isLoading={isLoading}
          onSubmit={this.handleSubmit}
          onChange={this.handleEmailChange}
          onWatchVideo={this.handleOpenVideo}
        />
        <HomePageBanner className="mobile-page-banner" />
        <div className="gallery">
          <Header size="huge" textAlign="center">
            {t('mobile_page.gallery_title')}
          </Header>
          <div className="thumbnail-column">
            <div className="thumbnail thumb-1" />
            <div className="thumbnail thumb-2" />
            <div className="thumbnail thumb-3" />
            <div className="thumbnail thumb-4" />
          </div>
        </div>
        <Hero className="secondary-hero" centered>
          <Hero.Header>{t('mobile_page.secondary_hero.title')}</Hero.Header>
          <Hero.Actions>
            <Button primary size="medium" disabled={isLoading} onClick={this.handleSecondaryAction}>
              {t('mobile_page.secondary_hero.action')}
            </Button>
          </Hero.Actions>
          <Hero.Content>
            <div className="background" />
          </Hero.Content>
        </Hero>
      </div>
    )
  }
}
