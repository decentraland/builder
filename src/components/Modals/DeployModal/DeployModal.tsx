import * as React from 'react'
import { Button, Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import Icon from 'components/Icon'
import DeployToLand from './DeployToLand'
import DeployToPool from './DeployToPool'
import ClearDeployment from './ClearDeployment'
import { Props, State, DeployModalView } from './DeployModal.types'
import './DeployModal.css'

export default class DeployModal extends React.PureComponent<Props, State> {
  state: State = {
    view: DeployModalView.NONE,
    projectId: null
  }

  componentDidMount() {
    const { metadata } = this.props
    if (metadata) {
      this.setState({
        view: metadata.view || DeployModalView.NONE,
        projectId: metadata.projectId || null
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

  handleClearDeployment = (projectId: string) => {
    this.setState({
      view: DeployModalView.CLEAR_DEPLOYMENT,
      projectId
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
    const { name } = this.props

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
    const { view, projectId } = this.state
    const { name } = this.props

    if (view === DeployModalView.CLEAR_DEPLOYMENT && projectId) {
      return <ClearDeployment projectId={projectId} name={name} onClose={this.handleClose} />
    }

    if (view === DeployModalView.DEPLOY_TO_LAND) {
      return (
        <DeployToLand
          name={name}
          onDeployToPool={this.handleDeployToPool}
          onClearDeployment={this.handleClearDeployment}
          onBack={this.handleBack}
          onClose={this.handleClose}
        />
      )
    }

    if (view === DeployModalView.DEPLOY_TO_POOL) {
      return <DeployToPool name={name} onClose={this.handleClose} />
    }

    return this.renderChoiceForm()
  }
}
