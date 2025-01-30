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
    const { name, project, scene } = this.props
    return (
      <Modal name={name} onClose={this.handleClickOutside}>
        <div className="modal-body">
          <Icon name="modal-close" className="modal-close-icon" onClick={this.handleClose} />
          <Header size="large" className="modal-title">
            {t('deployment_modal.title', { sceneName: project?.title ? `"${project.title}"` : '' })}
          </Header>
          <h5 className="deploy-modal-subtitle">{t('deployment_modal.subtitle')}</h5>
          <div className="deploy-modal-options">
            <div className="option-container">
              <div className="thumbnail deploy-to-world" />
              <div className="option-container-info">
                <span className="option-title">{t('deployment_modal.options.world.title')}</span>
                <span className="option-description">{t('deployment_modal.options.world.description', { br: () => <br /> })}</span>
                <Button primary onClick={this.handleDeployToWorld}>
                  <span>{t('deployment_modal.options.world.action')}</span>
                </Button>
                <a
                  className="learn-more-link"
                  href="https://docs.decentraland.org/creator/worlds/contributor/worlds/about/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('deployment_modal.learn_more')}
                </a>
              </div>
            </div>
            <div className="option-container">
              <div className="thumbnail deploy-to-land" />
              <div className="option-container-info">
                <span className="option-title">{t('deployment_modal.options.land.title')}</span>
                <span className="option-description">{t('deployment_modal.options.land.description', { br: () => <br /> })}</span>
                <Button primary onClick={this.handleDeployToLand}>
                  <span>{t('deployment_modal.options.land.action')}</span>
                </Button>
                <a
                  className="learn-more-link"
                  href="https://docs.decentraland.org/creator/editor/about-scene-editor/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('deployment_modal.learn_more')}
                </a>
              </div>
            </div>
          </div>
          {scene && scene.sdk6 ? (
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
          ) : null}
        </div>
      </Modal>
    )
  }

  render() {
    const { view, deploymentId, claimedName } = this.state
    const { name, currentPoolGroup, scene } = this.props

    if (view === DeployModalView.CLEAR_DEPLOYMENT && deploymentId) {
      return <ClearDeployment deploymentId={deploymentId} name={name} onClose={this.handleClose} />
    }

    if (view === DeployModalView.DEPLOY_TO_LAND || currentPoolGroup) {
      return (
        <DeployToLand
          name={name}
          scene={scene}
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
