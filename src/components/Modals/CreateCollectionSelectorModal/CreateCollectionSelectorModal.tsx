import { Button, ModalContent, ModalNavigation } from 'decentraland-ui'
import classNames from 'classnames'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation'
import { config } from 'config'
import collectionsImage from '../../../images/collections.png'
import linkedCollectionsImage from '../../../images/linked-collections.png'
import { Props } from './CreateCollectionSelectorModal.types'
import styles from './CreateCollectionSelectorModal.module.css'
import { CREATE_BUTTON_TEST_ID, DISABLED_DATA_TEST_ID } from './constants'

const CollectionSelection = ({
  image,
  title,
  subtitle,
  disabled,
  isLoading,
  onCreate,
  learnMoreUrl
}: {
  image: string
  title: string
  subtitle: string
  disabled?: boolean
  isLoading?: boolean
  learnMoreUrl: string
  onCreate: () => void
}) => {
  return (
    <div className={classNames(styles.collectionSelection)}>
      {disabled && <div data-testid={DISABLED_DATA_TEST_ID} className={styles.disabled}></div>}
      <img src={image} alt={title} />
      <div className={styles.content}>
        <div className={styles.text}>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <Button data-testid={CREATE_BUTTON_TEST_ID} primary disabled={disabled} loading={isLoading} onClick={onCreate}>
          {t('create_collection_selector_modal.actions.create')}
        </Button>
        <a href={learnMoreUrl}>{t('create_collection_selector_modal.actions.learn_more')}</a>
      </div>
    </div>
  )
}
const COLLECTIONS_LEARN_MORE_URL = `${config.get('DOCS_URL')}/creator/wearables-and-emotes/manage-collections/creating-collection/`
const LINKED_COLLECTIONS_LEARN_MORE_URL = `${config.get('DOCS_URL')}/creator/wearables/linked-wearables/`

export const CreateCollectionSelectorModal = (props: Props) => {
  const { onClose, onCreateCollection, onCreateThirdPartyCollection, name, isThirdPartyManager, isLoadingThirdParties } = props

  return (
    <Modal name={name} onClose={onClose} size="medium">
      <ModalNavigation
        title={t('create_collection_selector_modal.title')}
        subtitle={t('create_collection_selector_modal.subtitle')}
        onClose={onClose}
      />
      <ModalContent>
        <div className={styles.modalContent}>
          <CollectionSelection
            // Temporary image for the collections
            image={collectionsImage}
            title={t('create_collection_selector_modal.collection.title')}
            subtitle={t('create_collection_selector_modal.collection.subtitle')}
            onCreate={onCreateCollection}
            learnMoreUrl={COLLECTIONS_LEARN_MORE_URL}
          />
          <CollectionSelection
            // Temporary image for the linked wearables collections
            image={linkedCollectionsImage}
            title={t('create_collection_selector_modal.linked_collection.title')}
            subtitle={t('create_collection_selector_modal.linked_collection.subtitle')}
            onCreate={onCreateThirdPartyCollection}
            isLoading={isLoadingThirdParties}
            disabled={!isThirdPartyManager || isLoadingThirdParties}
            learnMoreUrl={LINKED_COLLECTIONS_LEARN_MORE_URL}
          />
        </div>
      </ModalContent>
    </Modal>
  )
}
