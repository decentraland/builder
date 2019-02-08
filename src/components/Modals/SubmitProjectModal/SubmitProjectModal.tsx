import * as React from 'react'
import { Form, Modal, Header, Field, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props, State } from './SubmitProjectModal.types'
import './SubmitProjectModal.css'

export default class SubmitProjectModal extends React.PureComponent<Props, State> {
  state = { title: '', description: '' }

  handleClose = () => {
    const { modal, onClose } = this.props
    onClose(modal.name)
  }

  // handleEmailChange = (event: React.FormEvent<HTMLInputElement>) => {
  //   this.setState({
  //     email: event.currentTarget.value
  //   })
  // }

  handleSubmit = () => {
    console.log('Submit form')
  }

  handleTitleChange = (event: React.FormEvent<HTMLInputElement>) => {
    console.log('handleTitleChange', event.currentTarget.value)
  }
  handleDescriptionChange = (event: React.FormEvent<HTMLInputElement>) => {
    console.log('handleDesciptionChange', event.currentTarget.value)
  }

  render() {
    const { modal } = this.props
    const { title, description } = this.state

    return (
      <Modal open={modal.open} className="SubmitProjectModal" size="small" onClose={this.handleClose}>
        <Modal.Content>
          <Header size="huge">{t('submit_project_modal.title')}</Header>

          <p className="subtitle">{t('contest_modal.start')}</p>
          <Form onSubmit={this.handleSubmit}>
            <Field type="title" placeholder="Project title" label={'Title'} value={title} onChange={this.handleTitleChange} />
            <Field
              type="description"
              placeholder="Project description"
              label={'Description'}
              value={description}
              onChange={this.handleDescriptionChange}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary size="medium">
            {t('submit_project_modal.submit').toUpperCase()}
          </Button>
          <Button size="medium">{t('global.cancel').toUpperCase()}</Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
