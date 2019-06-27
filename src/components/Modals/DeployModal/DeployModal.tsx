import * as React from 'react'
import { Button, Header } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import DeployToLand from './DeployToLand'
import DeployToPool from './DeployToPool'
import ClearDeployment from './ClearDeployment'
import { Props, State, DeployModalView } from './DeployModal.types'
import './DeployModal.css'

export default class DeployModal extends React.PureComponent<Props, State> {
  state: State = {
    view: DeployModalView.NONE
  }

  componentDidMount() {
    const { metadata } = this.props
    if (metadata && metadata.intent === 'clear_deployment') {
      this.setState({
        view: DeployModalView.CLEAR_DEPLOYMENT
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

  handleClose = () => {
    this.setState({
      view: DeployModalView.NONE
    })
    this.props.onClose()
  }

  renderChoiceForm = () => {
    return (
      <div className="choice-form">
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

  render() {
    const { name } = this.props
    const { view } = this.state

    return (
      <Modal name={name} onClose={this.handleClose}>
        {view === DeployModalView.CLEAR_DEPLOYMENT && <ClearDeployment onClose={this.handleClose} />}
        {view === DeployModalView.DEPLOY_TO_LAND && <DeployToLand onClose={this.handleClose} />}
        {view === DeployModalView.DEPLOY_TO_POOL && <DeployToPool onClose={this.handleClose} />}
        {view === DeployModalView.NONE && this.renderChoiceForm()}
      </Modal>
    )
  }
}
