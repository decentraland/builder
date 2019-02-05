import * as React from 'react'
import { Form, Modal, Header, Radio, Input, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import CloseModalIcon from '../CloseModalIcon'
import { Props, State } from './ContestModal.types'

import './ContestModal.css'

export default class ContestModal extends React.PureComponent<Props, State> {
  state = { hasAccepted: false, email: '' }

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

  handleToggleTermsAndConditions = () => {
    this.setState({ hasAccepted: !this.state.hasAccepted })
  }

  render() {
    const { modal } = this.props
    const { hasAccepted, email } = this.state

    return (
      <Modal
        open={modal.open}
        className="ContestModal"
        size="small"
        onClose={this.handleClose}
        closeIcon={<CloseModalIcon onClick={this.handleClose} />}
      >
        <Modal.Header>
          <div className="header-image" />
          <Header size="huge" className="hero">
            {t('contest_modal.title')}
          </Header>
        </Modal.Header>
        <Modal.Content>
          <div className="modal-row">
            <p className="explanation">
              {t('contest_modal.start')}
              <br />
              {t('contest_modal.know_more')}
            </p>
          </div>
          <Form onSubmit={this.handleSubmit}>
            <div onClick={this.handleToggleTermsAndConditions}>
              <Radio className="modal-row" defaultChecked={false} checked={hasAccepted} label={t('contest_modal.i_accept_the')} />
              &nbsp;
              <a href="https://decentraland.org/terms" rel="noopener noreferrer" target="_blank">
                {t('global.terms_and_conditions')}
              </a>
            </div>
            <div className="modal-row email-container">
              <Input type="email" placeholder="mail@domain.com" value={email} onChange={this.handleEmailChange} disabled={!hasAccepted} />
              <Button primary size="medium" disabled={!hasAccepted}>
                {t('contest_modal.send').toUpperCase()}
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
