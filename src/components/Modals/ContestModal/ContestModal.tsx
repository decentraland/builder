import * as React from 'react'
import { Form, Modal, Header, Radio, Input, Button } from 'decentraland-ui'
// import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import CloseModalIcon from '../CloseModalIcon'
import { Props, State } from './ContestModal.types'

import './ContestModal.css'

export default class ContestModal extends React.PureComponent<Props, State> {
  state = { hasAcceptedTerms: false, email: '' }

  handleClose = () => {
    const { modal, onClose } = this.props
    onClose(modal.name)
  }

  handleEmailChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      email: event.currentTarget.value
    })
  }

  handleSubmit = () => {
    const { email } = this.state
    if (email.trim()) {
      this.props.onRegisterEmail(email)
      this.handleClose()
    }
  }

  handleToggleTerms = () => {
    this.setState({ hasAcceptedTerms: !this.state.hasAcceptedTerms })
  }

  render() {
    const { modal } = this.props
    const { hasAcceptedTerms, email } = this.state

    return (
      <Modal
        open={modal.open}
        className="ContestModal"
        size="small"
        onClose={this.handleClose}
        closeIcon={<CloseModalIcon onClick={this.handleClose} />}
      >
        <Modal.Header>
          <Header size="huge" className="hero">
            Participate in our contest
          </Header>
        </Modal.Header>
        <Modal.Content>
          <div className="modal-row">
            Get in our contest and win LAND and a date with Fede!
            <br />
            To know more click here and read our blog post.
          </div>
          <Form onSubmit={this.handleSubmit}>
            <div onClick={this.handleToggleTerms}>
              <Radio className="modal-row" defaultChecked={false} checked={hasAcceptedTerms} label={`I accept the Terms & Conditions`} />
            </div>
            <div className="modal-row email-container">
              <Input
                type="email"
                placeholder="mail@domain.com"
                value={email}
                onChange={this.handleEmailChange}
                disabled={!hasAcceptedTerms}
              />
              <Button primary size="medium" disabled={!hasAcceptedTerms}>
                SEND
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
