import React, { useCallback, useState } from 'react'
import { Button, Column, Field, InputOnChangeData, Modal, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import './ConfirmCollectionNameStep.css'

export const ConfirmCollectionNameStep: React.FC<{ collection: Collection; onNextStep: () => void }> = props => {
  const { collection, onNextStep } = props
  const [collectionName, setCollectionName] = useState<string>('')
  const [hasError, setError] = useState<boolean>(false)

  const handleCollectionNameChange = useCallback((_: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    setCollectionName(value)
  }, [])

  const handleCollectionNameBlur = useCallback(() => {
    setError(collection.name !== collectionName)
  }, [collection, collectionName])

  const isDisabled = hasError || !collectionName

  return (
    <>
      <Modal.Content className="ConfirmCollectionNameStep">
        <Column>
          <Row className="details">
            <Column grow={true}>
              <p className="title">{t('publish_collection_modal_with_oracle.confirm_collection_name_step.title')}</p>
              <p className="subtitle">{t('publish_collection_modal_with_oracle.confirm_collection_name_step.subtitle')}</p>
              <p className="description">{t('publish_collection_modal_with_oracle.confirm_collection_name_step.description')}</p>
              <div className="fields">
                <Field
                  label={t('publish_collection_modal_with_oracle.confirm_collection_name_step.collection_name_label')}
                  value={collection.name}
                  disabled={true}
                />
                <Field
                  label={t('publish_collection_modal_with_oracle.confirm_collection_name_step.collection_name_confirmation_label')}
                  placeholder={t('publish_collection_modal_with_oracle.confirm_collection_name_step.collection_name_placeholder')}
                  value={collectionName}
                  error={hasError}
                  message={
                    hasError ? t('publish_collection_modal_with_oracle.confirm_collection_name_step.collection_names_different') : ''
                  }
                  onChange={handleCollectionNameChange}
                  onBlur={handleCollectionNameBlur}
                />
              </div>
            </Column>
          </Row>
          <Row className="actions" align="right">
            <Button className="proceed" primary onClick={onNextStep} disabled={isDisabled}>
              {t('publish_collection_modal_with_oracle.confirm_collection_name_step.confirm_name')}
            </Button>
          </Row>
        </Column>
      </Modal.Content>
    </>
  )
}

export default ConfirmCollectionNameStep
