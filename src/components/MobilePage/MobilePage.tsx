import * as React from 'react'
import { Field, Button, Form, Hero, Header } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
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

  handleSecondaryAction = () => window.open('https://contest.decentraland.org')

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
        <Hero className="main-hero" centered>
          <Hero.Header>{t('home_page.title')}</Hero.Header>
          <Hero.Description>
            <span className="description">
              <T
                id="home_page.subtitle"
                values={{
                  mana: <span className="highlight">{t('contest.mana')}</span>,
                  land: <span className="highlight">{t('contest.land')}</span>,
                  usd: <span className="highlight">{t('contest.usd')}</span>,
                  mana_per_scene: <span className="highlight">{t('contest.mana_per_scene')}</span>
                }}
              />
            </span>
          </Hero.Description>
          <Hero.Actions>
            <Form onSubmit={this.handleSubmit}>
              <p className="message">{t('mobile_page.message')}</p>

              {!hasMobileEmail ? (
                <div className="form-container">
                  <Field
                    type="email"
                    icon="asterisk"
                    placeholder="name@email.com"
                    value={email}
                    onChange={this.handleEmailChange}
                    disabled={isLoading}
                    required
                  />
                  <Button primary size="medium" disabled={isLoading}>
                    {t('global.sign_up')}
                  </Button>
                </div>
              ) : (
                <div className="success">{t('mobile_page.success')}</div>
              )}
            </Form>
            <Button className="hollow" onClick={this.handleOpenVideo}>
              {t('mobile_page.learn_more')}
            </Button>
          </Hero.Actions>

          <Hero.Content>
            <div className="background" />
          </Hero.Content>
        </Hero>
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
