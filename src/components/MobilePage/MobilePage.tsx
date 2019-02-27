import * as React from 'react'
import { Header, Field, Button, Form } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

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

  handleSubmit = () => {
    const { email } = this.state
    const analytics = getAnalytics()

    this.setState({ isLoading: true })

    analytics.identify({ email }, () => {
      // TODO: hit an special api for mailchimp
      localStorage.setItem('mobile-email', email)
      this.setState({ isLoading: false })
    })
  }

  render() {
    const { email, isLoading } = this.state
    const hasMobileEmail = !!localStorage.getItem('mobile-email')

    return (
      <div className="MobilePage">
        <Header size="large">{t('mobilepage.title')}</Header>
        <p className="subtitle">{t('mobilepage.subtitle')}</p>
        <Form onSubmit={this.handleSubmit}>
          <p className="message">{t('mobilepage.message')}</p>

          {!hasMobileEmail ? (
            <div className="form-container">
              <Field
                type="email"
                icon="asterisk"
                placeholder="you@your-email.com"
                value={email}
                onChange={this.handleEmailChange}
                disabled={isLoading}
                required
              />
              <Button primary size="medium" disabled={isLoading}>
                {t('global.send')}
              </Button>
            </div>
          ) : (
            <div className="success">{t('mobilepage.success')}</div>
          )}
        </Form>
        <span className="suggestion">
          Participate in our contest for a chance to <a href="http://contest.decentraland.org">earn MANA and LAND</a>
        </span>
      </div>
    )
  }
}
