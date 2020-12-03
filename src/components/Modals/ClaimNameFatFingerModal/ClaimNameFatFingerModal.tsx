import React from 'react'
import { ModalNavigation, Field, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, State } from './ClaimNameFatFingerModal.types'
import './ClaimNameFatFingerModal.css'

export default class ClaimNameFatFingerModal extends React.PureComponent<Props, State> {
  state: State = {
    currentName: ''
  }

  handleClaim = () => {
    const { onClaim, onClose } = this.props
    const { currentName } = this.state

    onClaim(currentName)
    onClose()
  }

  handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    this.setState({ currentName: name.replace(/\s/g, '') })
  }

  render() {
    const { name, metadata, onClose } = this.props
    const { originalName } = metadata
    const { currentName } = this.state
    const areNamesDifferent = currentName !== originalName
    const hasError = areNamesDifferent && currentName.length > 0
    return (
      <Modal name={name} onClose={onClose}>
        <ModalNavigation title={t('claim_name_fat_finger_modal.title')} onClose={onClose} />
        <Modal.Content>
          <div className="details">
            <T id="claim_name_fat_finger_modal.description" values={{ name: <strong>{originalName}</strong> }} />
          </div>
          <Field
            placeholder={t('claim_name_fat_finger_modal.name_placeholder')}
            value={currentName}
            error={hasError}
            message={hasError ? t('claim_name_fat_finger_modal.names_different') : ''}
            onChange={this.handleChangeName}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
          <Button primary onClick={this.handleClaim} disabled={areNamesDifferent}>
            {t('global.confirm')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
