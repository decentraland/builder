import React, { useCallback, useState } from 'react'
import { Button, Field, InputOnChangeData, Modal, ModalNavigation } from 'decentraland-ui'
import { Props } from './PublishWizardCollectionModal.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

export const CollectionNameFatFingerModal: React.FC<Pick<Props, 'collection' | 'onClose'> & { onHandleProceed: () => void }> = (props) => {
  const { collection, onClose, onHandleProceed } = props
  const [collectionName, setCollectionName] = useState<string>('')
  const [hasError, setError] = useState<boolean>(false)

  const handleCollectionNameChange = useCallback((_: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    setCollectionName(value)
  }, [])

  const handleCollectionNameBlur = useCallback(
    (_) => {
      setError(collection!.name !== collectionName)
    },
    [collection, collectionName]
  )

  return (
    <>
      <ModalNavigation title={t('publish_collection_modal_with_oracle.title')} onClose={onClose} />
      <Modal.Content className="first-step">
        <>
          <p>{t('publish_collection_modal_with_oracle.confirm_collection_name_fat_finger.title')}</p>
          <p>{t('publish_collection_modal_with_oracle.confirm_collection_name_fat_finger.description')}</p>
          <p>{t('publish_collection_modal_with_oracle.confirm_collection_name_fat_finger.description_details')}</p>
          <Field
            label={t('publish_collection_modal_with_oracle.confirm_collection_name_fat_finger.collection_name_label')}
            value={collection?.name}
            disabled={true}
          />
          <Field
            label={t('publish_collection_modal_with_oracle.confirm_collection_name_fat_finger.collection_name_confirmation_label')}
            placeholder={t('publish_collection_modal_with_oracle.confirm_collection_name_fat_finger.collection_name_placeholder')}
            value={collectionName}
            error={hasError}
            message={
              hasError ? t('publish_collection_modal_with_oracle.confirm_collection_name_fat_finger.collection_names_different') : ''
            }
            onChange={handleCollectionNameChange}
            onBlur={handleCollectionNameBlur}
          />
          <Button className="proceed" primary fluid onClick={onHandleProceed} disabled={hasError || !collectionName}>
            {t('global.next')}
          </Button>
        </>
      </Modal.Content>
    </>
  )
}

export default CollectionNameFatFingerModal
