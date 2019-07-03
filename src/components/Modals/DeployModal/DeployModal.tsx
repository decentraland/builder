import * as React from 'react'
import { Button, Header } from 'decentraland-ui'
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
    return (
      <div className="choice-form">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
        </div>
        <Header size="large" className="modal-title">
          Publish your scene
        </Header>
        <p className="modal-subtitle">You can deploy the scene to your LAND or submit it to the Scene Pool.</p>
        <div className="options">
          <div className="card">
            <div className="thumbnail deploy-to-pool" />
            <span className="title">Scene Pool</span>
            <span className="description">
              This will be an explanation on what is a Scene pool, so the users can understand what's going on.
            </span>
            <Button primary size="small" onClick={this.handleDeployToPool}>
              Apply
            </Button>
          </div>
          <div className="card">
            <div className="thumbnail deploy-to-land" />
            <span className="title">My LAND</span>
            <span className="description">This will be an explanation on what is a LAND, so the users can understand what's going on.</span>
            <Button primary size="small" onClick={this.handleDeployToLand}>
              Publish to LAND
            </Button>
          </div>
        </div>
      </div>
    )
  }

  wrapInModal = (view: JSX.Element) => {
    const { name } = this.props
    return (
      <Modal name={name} onClose={this.handleClickOutside}>
        {view}
      </Modal>
    )
  }

  render() {
    const { view, projectId } = this.state

    if (view === DeployModalView.CLEAR_DEPLOYMENT && projectId) {
      return this.wrapInModal(<ClearDeployment projectId={projectId} onClose={this.handleClose} />)
    }

    if (view === DeployModalView.DEPLOY_TO_LAND) {
      return this.wrapInModal(
        <DeployToLand
          onDeployToPool={this.handleDeployToPool}
          onClearDeployment={this.handleClearDeployment}
          onBack={this.handleBack}
          onClose={this.handleClose}
        />
      )
    }

    if (view === DeployModalView.DEPLOY_TO_POOL) {
      return this.wrapInModal(<DeployToPool onClose={this.handleClose} />)
    }

    return this.wrapInModal(this.renderChoiceForm())
  }
}
