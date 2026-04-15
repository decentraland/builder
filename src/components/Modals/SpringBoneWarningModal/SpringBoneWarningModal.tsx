import React from 'react'
import { BodyShape } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Modal } from 'decentraland-dapps/dist/containers'
import { ModalContent, ModalActions, Button, ModalHeader } from 'decentraland-ui'
import Icon from 'components/Icon'
import { Props, SpringBoneWarningModalMetadata } from './SpringBoneWarningModal.types'
import './SpringBoneWarningModal.css'

const SpringBoneWarningModal: React.FC<Props> = ({ name, metadata, onClose }) => {
  const { itemName, missingShapes, onSaveAnyway } = metadata as SpringBoneWarningModalMetadata

  const handleSaveAnyway = () => {
    onClose()
    onSaveAnyway()
  }

  return (
    <Modal name={name} onClose={onClose} size="tiny">
      <ModalHeader
        className="SpringBoneWarningModalHeader"
        content={t('item_editor.right_panel.spring_bones.warning.title', { name: itemName })}
      />
      <ModalContent className="SpringBoneWarningModalContent">
        <p>{t('item_editor.right_panel.spring_bones.warning.subtitle')}</p>
        <div className="WarningBox">
          <p className="WarningDescription">
            <Icon name="alert-warning" className="WarningIcon" /> {t('item_editor.right_panel.spring_bones.warning.missing_settings')}
          </p>
          <ul>
            {missingShapes.map(shape => (
              <li key={shape}>
                {shape === BodyShape.MALE
                  ? t('item_editor.right_panel.spring_bones.warning.missing_male')
                  : t('item_editor.right_panel.spring_bones.warning.missing_female')}
              </li>
            ))}
          </ul>
        </div>
      </ModalContent>
      <ModalActions className="SpringBoneWarningModalButtonsContainer">
        <Button secondary onClick={handleSaveAnyway}>
          {t('item_editor.right_panel.spring_bones.warning.save_anyway')}
        </Button>
        <Button primary onClick={onClose} size="small">
          {t('item_editor.right_panel.spring_bones.warning.go_back')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default SpringBoneWarningModal
