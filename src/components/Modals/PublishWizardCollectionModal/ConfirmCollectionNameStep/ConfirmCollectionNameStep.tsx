import React, { useCallback, useState } from 'react'
import { Button, Column, Field, InputOnChangeData, Modal, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import './ConfirmCollectionNameStep.css'

export const ConfirmCollectionNameStep: React.FC<{
  collection: Collection
  confirmedCollectionName: string
  onChangeCollectionName: (value: string) => void
  onNextStep: () => void
}> = props => {
  const { collection, confirmedCollectionName, onChangeCollectionName, onNextStep } = props
  const [collectionNameFocus, setCollectionNameFocus] = useState<boolean>(false)

  const handleCollectionNameChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
      onChangeCollectionName(value)
    },
    [onChangeCollectionName]
  )

  const handleCollectionNameFocus = useCallback(() => {
    setCollectionNameFocus(true)
  }, [])

  const handleCollectionNameBlur = useCallback(() => {
    setCollectionNameFocus(false)
  }, [])

  const hasValidCollectionName = collection.name === confirmedCollectionName
  const showError = !hasValidCollectionName && !collectionNameFocus && !!confirmedCollectionName
  const isDisabled = showError || !hasValidCollectionName

  return (
    <Modal.Content className="ConfirmCollectionNameStep">
      <Column>
        <Row className="details">
          <Column grow={true}>
            <p className="title">{t('publish_wizard_collection_modal.confirm_collection_name_step.title')}</p>
            <p className="subtitle">{t('publish_wizard_collection_modal.confirm_collection_name_step.subtitle')}</p>
            <p className="description">{t('publish_wizard_collection_modal.confirm_collection_name_step.description')}</p>
            <div className="fields">
              <Field
                label={t('publish_wizard_collection_modal.confirm_collection_name_step.collection_name_label')}
                value={collection.name}
                disabled={true}
              />
              <div className="confirm-collection-name">
                <Field
                  label={t('publish_wizard_collection_modal.confirm_collection_name_step.collection_name_confirmation_label')}
                  placeholder={t('publish_wizard_collection_modal.confirm_collection_name_step.collection_name_placeholder')}
                  value={confirmedCollectionName}
                  error={showError}
                  message={showError ? t('publish_wizard_collection_modal.confirm_collection_name_step.collection_names_different') : ''}
                  onChange={handleCollectionNameChange}
                  onBlur={handleCollectionNameBlur}
                  onFocus={handleCollectionNameFocus}
                  autoFocus
                />
              </div>
            </div>
          </Column>
        </Row>
        <Row className="actions" align="right">
          <Button className="proceed" primary onClick={onNextStep} disabled={isDisabled}>
            {t('publish_wizard_collection_modal.confirm_collection_name_step.confirm_name')}
          </Button>
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default ConfirmCollectionNameStep
