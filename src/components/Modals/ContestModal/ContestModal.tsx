import * as React from 'react'
import { Button, Loader, ModalNavigation, Input, InputOnChangeData } from 'decentraland-ui'

import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { locations } from 'routing/locations'

import LoginModal from '../LoginModal'
import { ShareModalType, ShareModalMetadata } from '../ShareModal/ShareModal.types'
import Countdown from './Countdown/Countdown'
import { Props, State } from './ContestModal.types'

import './ContestModal.css'

const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/gi
const ETH_ADDRESS_KEY = 'dcl-buillder-eth-address'

export default class ContestModal extends React.PureComponent<Props, State> {
  state: State = {
    isSuccess: false,
    ethAddress: localStorage.getItem(ETH_ADDRESS_KEY) || '',
    hasEthAddressError: false
  }

  analytics = getAnalytics()

  componentWillReceiveProps(nextProps: Props) {
    const { error, isSubmitting } = nextProps
    if (this.props.isSubmitting === true && isSubmitting === false && !error) {
      this.setState({
        isSuccess: true
      })
    }
  }

  componentWillUnmount() {
    this.setState({
      isSuccess: false
    })
  }

  handleLogin = () => {
    const { project, name, metadata, onLogin } = this.props
    onLogin({
      returnUrl: locations.editor(project.id),
      openModal: {
        name,
        metadata
      }
    })
  }

  handleShare = () => {
    const { project, onOpenModal } = this.props
    const projectId = project!.id

    onOpenModal('ShareModal', {
      type: ShareModalType.POOL,
      id: projectId
    } as ShareModalMetadata)
  }

  handleSubmit = async () => {
    const { ethAddress } = this.state
    const { project, onDeployToPool, poolGroup } = this.props
    const projectId = project!.id
    const poolGroupId = poolGroup!.id

    if (ethAddress && !ETH_ADDRESS.test(ethAddress)) {
      this.setState({ hasEthAddressError: true })
    } else {
      if (ethAddress) {
        this.analytics.identify({ ethAddress })
        localStorage.setItem(ETH_ADDRESS_KEY, ethAddress)
      }

      this.setState({ hasEthAddressError: false })
      onDeployToPool(projectId, { groups: [poolGroupId] })
    }

  }

  handleEthAddressChange = (_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ ethAddress: data.value, hasEthAddressError: false })
  }

  renderLogin() {
    return (
      <LoginModal
        name={this.props.name}
        onClose={this.props.onClose}
        onLogin={this.handleLogin}
        title={t('deployment_contest_modal.sign_in.title')}
        subtitle={t(`deployment_contest_modal.sign_in.subtitle`)}
        callToAction={t(`global.sign_in`)}
      />
    )
  }

  renderLoading() {
    return (
      <Modal name={this.props.name} onClose={this.props.onClose}>
        <Loader size="large" />
      </Modal>
    )
  }

  renderSuccess() {
    const { project } = this.props
    return (
      <Modal name={this.props.name} onClose={this.props.onClose}>
        <ModalNavigation
          title={t('deployment_contest_modal.success.title')}
          subtitle={t('deployment_contest_modal.success.subtitle')}
          onClose={this.props.onClose}
        />
        <div className="contest-modal">
          <div className="thumbnail" style={{ backgroundImage: `url("${project.thumbnail}")` }} />
        </div>
        <div className="contest-modal">
          <div className="button-group">
            <Button className="submit" size="small" primary onClick={this.handleShare}>
              {t('global.share')}
            </Button>
            <Button className="submit" size="small" secondary onClick={this.props.onClose}>
              {t('global.done')}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  renderProgress() {
    const { progress } = this.props

    const title = progress < 50 ? t('deployment_contest_modal.recording.title') : t('deployment_contest_modal.uploading.title')
    const subtitle = progress < 50 ? t('deployment_contest_modal.recording.subtitle') : t('deployment_contest_modal.uploading.subtitle')

    return (
      <Modal name={this.props.name} onClose={this.props.onClose}>
        <ModalNavigation title={title} subtitle={subtitle} onClose={this.props.onClose} />
        <div className="contest-modal">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </Modal>
    )
  }

  renderSubmit() {
    const { hasEthAddressError } = this.state
    const { isReady, poolGroup } = this.props
    const until = (poolGroup && poolGroup.activeUntil) || new Date()
    return (
      <Modal name={this.props.name} onClose={this.props.onClose}>
        <ModalNavigation
          title={t('deployment_contest_modal.submit.title')}
          subtitle={t('deployment_contest_modal.submit.subtitle')}
          onClose={this.props.onClose}
        />
        <div className="contest-modal">
          <Countdown until={until} />
        </div>
        <div className="contest-modal">
          <label className={hasEthAddressError ? "error" : ""}>
            <p className="label">{t('deployment_contest_modal.submit.eth_address')}</p>
            <Input defaultValue={this.state.ethAddress} placeholder="0x0000000000000000000000000000000000000000" onChange={this.handleEthAddressChange} size="small" />
            {hasEthAddressError && <p className="note">{t('deployment_contest_modal.submit.invalid_eth_address')}</p>}
          </label>
        </div>
        <div className="contest-modal">
          <Button size="small" primary onClick={this.handleSubmit} loading={!isReady} disabled={!isReady}>
            {t('global.submit')}
          </Button>
        </div>
      </Modal>
    )
  }

  render() {
    const { isSuccess } = this.state
    const { isLoggedIn, isLoading, isSubmitting } = this.props

    if (isLoading) {
      return this.renderLoading()
    }

    if (!isLoggedIn) {
      return this.renderLogin()
    }

    if (isSubmitting) {
      return this.renderProgress()
    }

    if (isSuccess) {
      return this.renderSuccess()
    }

    return this.renderSubmit()
  }
}
