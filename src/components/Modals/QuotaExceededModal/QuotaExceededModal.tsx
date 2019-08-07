import * as React from 'react'
import { Close, Button } from 'decentraland-ui'
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
      <Modal.Content>We were unable to save your work</Modal.Content>
      <Modal.Actions>
        <Button primary onClick={this.handleClick}>
          Retry
        </Button>
      </Modal.Actions>
    </>
  )

  renderSignIn = () => (
    <>
      <Modal.Content>You ran out of anonymous storage space, please sign in to continue</Modal.Content>
      <Modal.Actions>
        <Button primary onClick={this.handleClick}>
          Sign in
        </Button>
      </Modal.Actions>
    </>
  )

  render() {
    const { name, currentProject, isLoggedIn, onClose } = this.props

    const offerRetry = currentProject && isLoggedIn

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>Oh noes</Modal.Header>
        {offerRetry ? this.renderRetry() : this.renderSignIn()}
      </Modal>
    )
  }
}
