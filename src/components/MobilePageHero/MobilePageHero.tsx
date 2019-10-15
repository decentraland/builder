import * as React from 'react'
import isMobile from 'ismobilejs'
import { Hero, Button, Form, Field } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { env } from 'decentraland-commons'

import { Props } from './MobilePageHero.types'
import './MobilePageHero.css'

const PUBLIC_URL = env.get('PUBLIC_URL')

export default class MobilePageHero extends React.PureComponent<Props> {
  handleSubmit = () => {
    this.props.onSubmit()
  }

  handleWatchVideo = () => {
    this.props.onWatchVideo()
  }

  handleEmailChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onChange(event)
  }

  render() {
    const { email, isLoading, hasMobileEmail } = this.props

    return (
      <Hero className="MobilePageHero" centered>
        <Hero.Header>{t('home_page.title')}</Hero.Header>
        <Hero.Description>
          <span className="description">
            <T id="home_page.subtitle" />
          </span>
        </Hero.Description>
        <Hero.Actions>
          {isMobile().any ? (
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
          ) : (
            <p className="message">{t('mobile_page.desktop_too_narrow')}</p>
          )}
          <Button className="hollow" onClick={this.handleWatchVideo}>
            {t('mobile_page.learn_more')}
          </Button>
        </Hero.Actions>

        <Hero.Content>
          <video src={`${PUBLIC_URL}/videos/hero_mobile.mp4`} autoPlay loop muted playsInline />
          <div className="overlay" />
        </Hero.Content>
      </Hero>
    )
  }
}
