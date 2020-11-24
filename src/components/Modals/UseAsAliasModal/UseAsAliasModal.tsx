import * as React from 'react'
import { ModalNavigation, Button, ModalContent, ModalActions } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getNameFromDomain } from 'modules/ens/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './UseAsAliasModal.types'

export default class UseAsAliasModal extends React.PureComponent<Props, State> {
  handleSubmit = () => {
    const { onSubmit, address, metadata } = this.props
    if (address) {
      onSubmit(address, metadata.name)
    }
  }

  render() {
    const { onClose, isLoading, aliases } = this.props
    const { name, oldName } = this.props.metadata
    const aliasName = aliases.length > 0 ? getNameFromDomain(aliases[0].subdomain) : ''

    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation title={t('use_as_alias_modal.title')} subtitle={t('use_as_alias_modal.subtitle')} onClose={onClose} />
        <ModalContent>
          <p>{t('use_as_alias_modal.body', { name, oldName })}</p>
        </ModalContent>
        <ModalActions>
          {name === aliasName && !isLoading ? (
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
