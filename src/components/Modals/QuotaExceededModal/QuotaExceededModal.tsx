import * as React from 'react'
import { Close, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props } from './QuotaExceededModal.types'
import './QuotaExceededModal.css'

export default class QuotaExceeded extends React.PureComponent<Props> {
  handleClick = () => {
    this.props.onAuth()
    this.props.onClose()
  }

  renderRetry = () => (
    <>
      <Modal.Header>{t('quota_exceeded_modal.retry.title')}</Modal.Header>
      <Modal.Content>{t('quota_exceeded_modal.retry.description')}</Modal.Content>
      <Modal.Actions>
        <Button primary onClick={this.handleClick}>
          {t('sync.retry')}
        </Button>
      </Modal.Actions>
    </>
  )

  renderSignIn = () => (
    <>
      <Modal.Header>{t('quota_exceeded_modal.sign_in.title')}</Modal.Header>
      <Modal.Content>{t('quota_exceeded_modal.sign_in.description')}</Modal.Content>
      <Modal.Actions>
        <Button primary onClick={this.handleClick}>
          {t('user_menu.sign_in')}
        </Button>
      </Modal.Actions>
    </>
  )

  render() {
    const { name, currentProject, isLoggedIn, onClose } = this.props

    const offerRetry = currentProject && isLoggedIn

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        {offerRetry ? this.renderRetry() : this.renderSignIn()}
      </Modal>
    )
  }
}
