import * as React from 'react'
import { ModalNavigation, ModalContent, ModalActions, Button, Field, InputOnChangeData, Form } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { DecodedURN, decodeURN, URNType } from 'lib/urn'
import { Props, State } from './EditURNModal.types'

export default class EditURNModal extends React.PureComponent<Props, State> {
  decodedURN: DecodedURN<URNType.COLLECTIONS_THIRDPARTY> = this.decodeURN()

  state: State = {
    newURNSection: ''
  }

  handleURNChange = (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ newURNSection: data.value })
  }

  handleSubmit = () => {
    const { onSave } = this.props
    const urn = this.getUpdatedURN()

    onSave(urn)
  }

  getUpdatedURN() {
    const { urn, onBuildURN } = this.props
    const { newURNSection } = this.state

    if (!newURNSection) {
      return urn
    }

    return onBuildURN(this.decodedURN, newURNSection)
  }

  decodeURN() {
    const { urn } = this.props
    const decodedURN = decodeURN(urn)
    if (decodedURN.type !== URNType.COLLECTIONS_THIRDPARTY) {
      throw new Error(`Invalid URN type ${this.decodedURN.type}`)
    }
    return decodedURN
  }

  render() {
    const { name, elementName, onClose, isLoading } = this.props
    const { newURNSection } = this.state

    return (
      <Modal name={name} onClose={onClose} size="tiny">
        <ModalNavigation
          title={t('edit_urn_modal.title')}
          subtitle={t('edit_urn_modal.subtitle', { name: elementName })}
          onClose={onClose}
        />
        <Form onSubmit={this.handleSubmit}>
          <ModalContent>
            <Field label={t('global.urn')} message={this.getUpdatedURN()} value={newURNSection} onChange={this.handleURNChange} />
          </ModalContent>
          <ModalActions>
            <Button primary loading={isLoading} disabled={!newURNSection}>
              {t('global.save')}
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}
