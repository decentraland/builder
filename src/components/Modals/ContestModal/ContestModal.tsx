import * as React from 'react'
import { Form, Header, Radio, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import CloseModalIcon from '../CloseModalIcon'
import { Props, State } from './ContestModal.types'

import './ContestModal.css'

export default class ContestModal extends React.PureComponent<Props, State> {
  state = { hasAcceptedTerms: false }

  handleSubmit = () => {
    const { onAcceptTerms, onOpenModal, onClose } = this.props
    const { hasAcceptedTerms } = this.state
    if (hasAcceptedTerms) {
      onAcceptTerms()
      onClose()
      onOpenModal('AddToContestModal')
    }
  }

  handleToggleTermsAndConditions = (_: any) => {
    this.setState({ hasAcceptedTerms: !this.state.hasAcceptedTerms })
  }

  render() {
    const { name, onClose } = this.props
    const { hasAcceptedTerms } = this.state

    return (
      <Modal name={name} closeIcon={<CloseModalIcon onClick={onClose} />}>
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
              <T
                id="contest_modal.know_more"
                values={{
                  blog_post_link: (
                    <a href="https://blog.decentraland.org" rel="noopener noreferrer" target="_blank">
                      {t('global.blog_post')}
                    </a>
                  )
                }}
              />
            </p>
          </div>
          <Form onSubmit={this.handleSubmit}>
            <div className="modal-row">
              <span onClick={this.handleToggleTermsAndConditions}>
                <Radio defaultChecked={false} checked={hasAcceptedTerms} label={t('contest_modal.i_accept_the')} />
              </span>
              &nbsp;
              <a href="https://decentraland.org/terms" rel="noopener noreferrer" target="_blank">
                {t('global.terms_and_conditions')}
              </a>
            </div>
            <div className="buttons-container">
              <Button primary size="medium" disabled={!hasAcceptedTerms}>
                {t('global.continue')}
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
