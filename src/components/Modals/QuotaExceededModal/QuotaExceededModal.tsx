import * as React from 'react'
import { Close, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import WalletLoginModal from '../WalletLoginModal'
import { Props, State } from './QuotaExceededModal.types'
import './QuotaExceededModal.css'

export default class QuotaExceeded extends React.PureComponent<Props, State> {
  state = {
    isLoginModalOpen: false
  }

  componentWillReceiveProps(props: Props) {
    const isLoading = props.loading.size
    const wasLoading = this.props.loading.size
    const hasErrors = props.errors.size
    const hadErrors = this.props.errors.size

    if (!isLoading && wasLoading && !hasErrors && hadErrors) {
      this.props.onClose()
    }

    if (props.isLoggingIn) {
      this.handleCloseLoginModal()
    }
  }

  handleOpenLoginModal = () => {
    this.setState({ isLoginModalOpen: true })
  }

  handleCloseLoginModal = () => {
    this.setState({ isLoginModalOpen: false })
  }

  handleRetry = () => {
    this.props.onRetry()
  }

  renderLogin = () => {
    const { name } = this.props
    return <WalletLoginModal name={name} onClose={this.handleCloseLoginModal as any} />
  }

  renderRetry = () => {
    const { loading } = this.props
    const isLoading = loading.size > 0

    return (
      <>
        <Modal.Header>{t('quota_exceeded_modal.retry.title')}</Modal.Header>
        <Modal.Content>{t('quota_exceeded_modal.retry.description')}</Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.handleRetry} disabled={isLoading}>
            {isLoading ? t('global.loading') : t('sync.retry')}
          </Button>
        </Modal.Actions>
      </>
    )
  }

  renderSignIn = () => (
    <>
      <Modal.Header>{t('quota_exceeded_modal.sign_in.title')}</Modal.Header>
      <Modal.Content>{t('quota_exceeded_modal.sign_in.description')}</Modal.Content>
      <Modal.Actions>
        <Button primary onClick={this.handleOpenLoginModal}>
          {t('user_menu.sign_in')}
        </Button>
      </Modal.Actions>
    </>
  )

  render() {
    const { name, currentProject, isLoggedIn, isLoggingIn, onClose } = this.props
    const { isLoginModalOpen } = this.state

    const shouldRetry = currentProject && isLoggedIn

    return isLoginModalOpen && !isLoggingIn && !isLoggedIn ? (
      this.renderLogin()
    ) : (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        {shouldRetry ? this.renderRetry() : this.renderSignIn()}
      </Modal>
    )
  }
}
