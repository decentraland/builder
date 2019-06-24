import * as React from 'react'
import { Button, Header } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import DeployToLand from './DeployToLand'
import DeployToPool from './DeployToPool'
import { Props, State } from './DeployModal.types'
import './DeployModal.css'

export default class DeployModal extends React.PureComponent<Props, State> {
  state = {
    hasLand: null
  }

  handleDeployToLand = () => {
    this.setState({
      hasLand: true
    })
  }

  handleDeployToPool = () => {
    this.setState({
      hasLand: false
    })
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
            <span className="title">Scene Pool</span>
            <span className="description">
              This will be an explanation on what is a Scene pool, so the users can understand what's going on.
            </span>
            <Button primary size="small" onClick={this.handleDeployToPool}>
              Apply
            </Button>
          </div>
          <div className="card">
            <span className="title">Land Pool</span>
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
    const { name, onClose } = this.props
    const { hasLand } = this.state

    return (
      <Modal name={name} onClose={onClose}>
        {hasLand === true && <DeployToLand onClose={onClose} />}
        {hasLand === false && <DeployToPool onClose={onClose} />}
        {hasLand === null && this.renderChoiceForm()}
      </Modal>
    )
  }
}
