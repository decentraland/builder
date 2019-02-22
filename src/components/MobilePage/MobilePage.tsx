import * as React from 'react'
import { Header, Field, Button, Form } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import { Props, State } from './MobilePage.types'
import './MobilePage.css'

export default class MobilePage extends React.PureComponent<Props, State> {
  state = {
    email: ''
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
    analytics.identify({ email }, () => {
      analytics.track('Mobile email', { email }, () => {
        window.location.href = 'https://contest.decentraland.org/'
      })
    })
  }

  render() {
    const { email } = this.state

    return (
      <div className="MobilePage">
        <Header size="large">{t('mobilepage.title')}</Header>
        <p className="subtitle">{t('mobilepage.subtitle')}</p>
        <Form onSubmit={this.handleSubmit}>
          <p className="message">{t('mobilepage.message')}</p>
          <div className="form-container">
            <Field type="email" icon="asterisk" placeholder="mail@domain.com" value={email} onChange={this.handleEmailChange} required />
            <Button primary size="medium">
              {t('global.send')}
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}
