import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import DeployToLand from './DeployToLand'
import DeployToPool from './DeployToPool'
import { Props, State } from './DeployModal.types'
import './DeployModal.css'
import { Button } from 'decentraland-ui'

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
      <>
        <Button primary onClick={this.handleDeployToLand}>
          I own land
        </Button>
        <Button secondary onClick={this.handleDeployToPool}>
          I don't land
        </Button>
      </>
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
