import * as React from 'react'
import { ModalNavigation, Button, ModalContent, ModalActions } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props } from './UseAsAliasModal.types'

export default class UseAsAliasModal extends React.PureComponent<Props> {
  handleSubmit = () => {
    const { onSubmit, address } = this.props
    const { newName } = this.props.metadata
    if (address) {
      onSubmit(address, newName)
    }
  }

  render() {
    const { onClose, isLoading, aliases, name: oldName } = this.props
    const { newName } = this.props.metadata
    const aliasName = aliases.length > 0 ? aliases[0].name : ''
    const successOnSetAlias = newName === aliasName && !isLoading

    return (
      <Modal name={newName} onClose={onClose} size="tiny">
        <ModalNavigation title={t('use_as_alias_modal.title')} subtitle={t('use_as_alias_modal.subtitle')} onClose={onClose} />
        <ModalContent>
          <p>
            {successOnSetAlias ? (
              <T id="use_as_alias_modal.success" values={{ name: <b>{newName}</b> }} />
            ) : (
              <T id="use_as_alias_modal.body" values={{ newName: <b>{newName}</b>, oldName: <b>{oldName}</b> }} />
            )}
          </p>
        </ModalContent>
        <ModalActions>
          {successOnSetAlias ? (
            <Button primary onClick={onClose}>
              {t('global.done')}
            </Button>
          ) : (
            <Button primary loading={isLoading} onClick={this.handleSubmit}>
              {t('global.confirm')}
            </Button>
          )}
        </ModalActions>
      </Modal>
    )
  }
}
