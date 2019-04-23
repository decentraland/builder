import * as React from 'react'
import { Close, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import { EMAIL_INTEREST, api } from 'lib/api'
import { Props, State } from './DeployModal.types'
import './DeployModal.css'

export default class DeployModal extends React.PureComponent<Props, State> {
  state = {
    isLoading: false,
    email: ''
  }

  handleSubmitEmail = async () => {
    const { email } = this.state
    const analytics = getAnalytics()

    this.props.onSetEmail(email)
    this.setState({ isLoading: true })
    analytics.identify({ email })
    api.reportEmail(email, EMAIL_INTEREST.PUBLISH).catch(() => console.error('Unable to submit email, something went wrong!'))
    this.setState({ isLoading: false })
  }

  handleEmailChange = (event: React.FormEvent<HTMLInputElement>) => {
    const email = event.currentTarget.value
    this.setState({ email })
  }

  render() {
    const { name, onClose } = this.props
    const { email, isLoading } = this.state
    const existingEmail = this.props.email

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>{t('deploy_modal.title')}</Modal.Header>
        <Modal.Content>
          <span className="description">{t('deploy_modal.description')}</span>
          <Field
            type="email"
            label={t('global.email')}
            placeholder="you@your-email.com"
            value={existingEmail || email}
            onChange={this.handleEmailChange}
            disabled={isLoading || !!existingEmail}
            action={t('global.subscribe')}
            onAction={this.handleSubmitEmail}
            message={existingEmail ? t('deploy_modal.email_thanks') : ''}
          />
        </Modal.Content>
      </Modal>
    )
  }
}
