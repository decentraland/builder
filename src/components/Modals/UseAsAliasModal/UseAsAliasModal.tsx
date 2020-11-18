import * as React from 'react'
import { ModalNavigation, Button, Form, ModalContent, ModalActions } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './UseAsAliasModal.types'
import './UseAsAliasModal.css'

export default class UseAsAliasModal extends React.PureComponent<Props, State> {
  state: State = {
    done: false
  }
  handleSubmit = () => {
    if (!this.state.done) {
      this.setState({ done: true })
      this.props.onSubmit(this.props.metadata.name)
    }
  }

  render() {
    const { onClose, isLoading } = this.props
    const { name, oldname } = this.props.metadata
    const { done } = this.state
    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation title={t('use_as_alias_modal.title')} subtitle={t('use_as_alias_modal.subtitle')} onClose={onClose} />
        <Form onSubmit={this.handleSubmit}>
          <ModalContent>
            <p> {t('use_as_alias_modal.body', { name, oldname })} </p>
          </ModalContent>
          <ModalActions>
            {done && !isLoading ? (
              <Button primary onClick={onClose}>
                {t('use_as_alias_modal.looks_great')}
              </Button>
            ) : (
              <Button primary loading={isLoading} onClick={this.handleSubmit}>
                {t('global.confirm')}
              </Button>
            )}
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}
