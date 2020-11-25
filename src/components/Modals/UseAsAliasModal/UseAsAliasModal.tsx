import * as React from 'react'
import { ModalNavigation, Button, ModalContent, ModalActions } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getNameFromDomain } from 'modules/ens/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './UseAsAliasModal.types'

export default class UseAsAliasModal extends React.PureComponent<Props, State> {
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
    const aliasName = aliases.length > 0 ? getNameFromDomain(aliases[0].subdomain) : ''

    return (
      <Modal name={newName} onClose={onClose} size="tiny">
        <ModalNavigation title={t('use_as_alias_modal.title')} subtitle={t('use_as_alias_modal.subtitle')} onClose={onClose} />
        <ModalContent>
          <p>{t('use_as_alias_modal.body', { newName, oldName })}</p>
        </ModalContent>
        <ModalActions>
          {newName === aliasName && !isLoading ? (
            <Button primary onClick={onClose}>
              {t('use_as_alias_modal.looks_great')}
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
