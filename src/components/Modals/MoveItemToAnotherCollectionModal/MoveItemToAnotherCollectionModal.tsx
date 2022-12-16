import React, { useState, useCallback } from 'react'
import { ModalNavigation, ModalContent, ModalActions, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Collection } from 'modules/collection/types'
import { isTPCollection } from 'modules/collection/utils'
import CollectionDropdown from 'components/CollectionDropdown'
import { Props, MoveItemToAnotherCollectionModalMetadata } from './MoveItemToAnotherCollectionModal.types'
import './MoveItemToAnotherCollectionModal.css'

export const MoveItemToAnotherCollectionModal: React.FC<Props> = props => {
  const { name, onClose, metadata, isLoading } = props
  const { item, fromCollection } = metadata as MoveItemToAnotherCollectionModalMetadata
  const [collection, setCollection] = useState<Collection>()

  const handleChangeCollection = useCallback((collection: Collection) => {
    setCollection(collection)
  }, [])

  const handleSubmit = useCallback(() => {
    const { onSubmit } = props
    if (collection) {
      onSubmit(item, collection.id)
    }
  }, [collection, item, props])

  return (
    <Modal name={name} onClose={onClose} size="tiny" closeOnDimmerClick={false}>
      <ModalNavigation
        title={t('move_item_to_another_collection_modal.title')}
        subtitle={t('move_item_to_another_collection_modal.subtitle')}
        onClose={onClose}
      />
      <ModalContent>
        <>
          <p className="collection-dropdown-label">{t('item.collection')}</p>
          <CollectionDropdown
            value={collection}
            onChange={handleChangeCollection}
            filter={collection => !isTPCollection(collection) && !collection.isPublished && collection.id !== fromCollection.id}
            fetchCollectionParams={{ isPublished: false }}
          />
        </>
      </ModalContent>
      <ModalActions>
        <Button primary onClick={handleSubmit} loading={isLoading} disabled={isLoading || !item || !collection}>
          {t('move_item_to_another_collection_modal.confirm')}
        </Button>
        <Button secondary onClick={() => collection && onClose()} loading={isLoading} disabled={isLoading}>
          {t('move_item_to_another_collection_modal.cancel')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default MoveItemToAnotherCollectionModal
