import * as React from 'react'
import { Button, Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import Icon from 'components/Icon'
import DeployToLand from './DeployToLand'
import DeployToPool from './DeployToPool'
import DeployToWorld from './DeployToWorld'
import ClearDeployment from './ClearDeployment'
import { Props, State, DeployModalView } from './DeployModal.types'
import './DeployModal.css'

export default class DeployModal extends React.PureComponent<Props, State> {
  state: State = {
    view: DeployModalView.NONE,
    deploymentId: null,
    claimedName: null
  }

  componentDidMount() {
    const { metadata } = this.props
    if (metadata) {
      this.setState({
        view: metadata.view || DeployModalView.NONE,
        deploymentId: metadata.deploymentId || null,
        claimedName: metadata?.claimedName || null
      })
    }
  }

  handleDeployToLand = () => {
    this.setState({
      view: DeployModalView.DEPLOY_TO_LAND
    })
  }

  handleDeployToPool = () => {
    this.setState({
      view: DeployModalView.DEPLOY_TO_POOL
    })
  }

  handleDeployToWorld = () => {
    this.setState({
      view: DeployModalView.DEPLOY_TO_WORLD
    })
  }

  handleClickOutside = () => {
    if (this.state.view === DeployModalView.NONE) {
      this.props.onClose()
    }
  }

  handleClose = () => {
    this.setState({
      view: DeployModalView.NONE
    })
    this.props.onClose()
  }

  handleBack = () => {
    this.setState({
      view: DeployModalView.NONE
    })
  }

  renderChoiceForm = () => {
    const { name, isDeployToWorldEnabled } = this.props

    if (isDeployToWorldEnabled) {
      return (
        <Modal name={name} onClose={this.handleClickOutside}>
          <div className="modal-body">
            <Icon name="modal-close" className="modal-close-icon" onClick={this.handleClose} />
            <Header size="large" className="modal-title">
              {t('deployment_modal.title')}
            </Header>
            <h5 className="deploy-modal-subtitle">{t('deployment_modal.subtitle')}</h5>
            <div className="deploy-modal-options">
              <div className="option-container">
                <div className="thumbnail deploy-to-world" />
                <span className="option-title">{t('deployment_modal.options.world.title')}</span>
                <span className="option-description">
                  {t('deployment_modal.options.world.description', { br: () => <br /> })}
                  <a className="learn-more-link" href="https://docs.decentraland.org/" target="_blank" rel="noreferrer">
                    {t('deployment_modal.learn_more')}
                  </a>
                </span>
                <Button primary onClick={this.handleDeployToWorld}>
                  <span>{t('deployment_modal.options.world.action')}</span>
                </Button>
              </div>
              <div className="option-container">
                <div className="thumbnail deploy-to-land" />
                <span className="option-title">{t('deployment_modal.options.land.title')}</span>
                <span className="option-description">
                  {t('deployment_modal.options.land.description', { br: () => <br /> })}
                  <a className="learn-more-link" href="https://docs.decentraland.org/" target="_blank" rel="noreferrer">
                    {t('deployment_modal.learn_more')}
                  </a>
                </span>
                <Button primary onClick={this.handleDeployToLand}>
                  <span>{t('deployment_modal.options.land.action')}</span>
                </Button>
              </div>
            </div>
            <div className="scene-pool-option">
              <div className="thumbnail deploy-to-pool" />
              <div className="scene-pool-description">
                <span className="option-title">{t('deployment_modal.options.pool.title')}</span>
                <span className="option-description">{t('deployment_modal.options.pool.description')}</span>
              </div>
              <Button secondary onClick={this.handleDeployToPool} className="scene-pool-action">
                <span>{t('deployment_modal.options.pool.action')}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )
    }

    return (
      <Modal name={name} onClose={this.handleClickOutside}>
        <div className="choice-form">
          <div className="modal-header">
            <Icon name="modal-close" onClick={this.handleClose} />
          </div>
          <Header size="large" className="modal-title">
            {t('deployment_modal.title')}
          </Header>
          <p className="modal-subtitle">{t('deployment_modal.description')}</p>
          <div className="options">
            <div className="card">
              <div className="thumbnail deploy-to-pool" />
              <span className="title">{t('deployment_modal.option_pool.title')}</span>
              <span className="description">{t('deployment_modal.option_pool.description')}</span>
              <Button primary size="small" onClick={this.handleDeployToPool}>
                {t('deployment_modal.option_pool.action')}
              </Button>
            </div>
            <div className="card">
              <div className="thumbnail deploy-to-land" />
              <span className="title">{t('deployment_modal.option_land.title')}</span>
              <span className="description">{t('deployment_modal.option_land.description')}</span>
              <Button primary size="small" onClick={this.handleDeployToLand}>
                {t('deployment_modal.option_land.action')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  render() {
    const { view, deploymentId, claimedName } = this.state
    const { name, currentPoolGroup } = this.props

    if (view === DeployModalView.CLEAR_DEPLOYMENT && deploymentId) {
      return <ClearDeployment deploymentId={deploymentId} name={name} onClose={this.handleClose} />
    }

    if (view === DeployModalView.DEPLOY_TO_LAND || currentPoolGroup) {
      return (
        <DeployToLand
          name={name}
          onDeployToPool={this.handleDeployToPool}
          onDeployToWorld={this.handleDeployToWorld}
          onBack={this.handleBack}
          onClose={this.handleClose}
        />
      )
    }

    if (view === DeployModalView.DEPLOY_TO_POOL) {
      return <DeployToPool name={name} onClose={this.handleClose} />
    }

    if (view === DeployModalView.DEPLOY_TO_WORLD) {
      return <DeployToWorld claimedName={claimedName} name={name} onClose={this.handleClose} onBack={this.handleBack} />
    }

    return this.renderChoiceForm()
  }
}
