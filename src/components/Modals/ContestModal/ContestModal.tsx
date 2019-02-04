import * as React from 'react'
import { Form, Modal, Header, Radio, Button } from 'decentraland-ui'
// import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import CloseModalIcon from '../CloseModalIcon'
import { Props } from '../Modals.types'

import './ContestModal.css'

export default class ContestModal extends React.PureComponent<Props> {
  state = { hasAcceptedTerms: false }

  handleClose = () => {
    const { modal, onClose } = this.props
    onClose(modal.name)
  }

  handleSubmit = () => {
    console.log('Submit form')
  }

  handleToggleTerms = () => {
    this.setState({ hasAcceptedTerms: !this.state.hasAcceptedTerms })
  }

  render() {
    const { modal } = this.props
    const { hasAcceptedTerms } = this.state

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
              <input type="email" placeholder="mail@domain.com" />
              <Button primary size="medium">
                SEND
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
