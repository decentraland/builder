import React from 'react'
import { Dropdown, Button, Icon, Popup } from 'decentraland-ui'
import { useHistory } from 'react-router-dom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getCollectionEditorURL, isLocked } from 'modules/collection/utils'
import { FromParam } from 'modules/location/types'
import { CreateOrEditMultipleItemsModalType } from 'components/Modals/CreateAndEditMultipleItemsModal/CreateAndEditMultipleItemsModal.types'
import ConfirmDelete from 'components/ConfirmDelete'
import { Props } from './CollectionContextMenu.types'
import styles from './CollectionContextMenu.module.css'

const CollectionContextMenu: React.FC<Props> = props => {
  const { collection } = props
  const history = useHistory()

  const handleNavigateToForum = () => {
    if (collection.isPublished && collection.forumLink) {
      navigateTo(collection.forumLink, '_blank')
    }
  }

  const handleSeeInWorld = () => {
    const { items, onOpenModal } = props
    onOpenModal('SeeInWorldModal', { itemIds: items.map(item => item.id) })
  }

  const handleNavigateToEditor = () => {
    const { collection, items } = props
    history.push(getCollectionEditorURL(collection, items), { fromParam: FromParam.TP_COLLECTIONS })
  }

  const handleDeleteCollection = () => {
    const { collection, onDelete } = props
    onDelete(collection)
  }

  const handleEditURN = () => {
    const { collection, onOpenModal } = props
    if (!collection.isPublished) {
      onOpenModal('EditCollectionURNModal', { collection })
    }
  }

  const handleEditInBulk = () => {
    const { collection, onOpenModal } = props
    onOpenModal('CreateAndEditMultipleItemsModal', { collectionId: collection.id, type: CreateOrEditMultipleItemsModalType.EDIT })
  }

  const navigateTo = (url: string, target = '') => {
    const newWindow = window.open(url, target)
    if (newWindow) {
      newWindow.focus()
    }
  }

  const canDelete = !isLocked(collection) && !collection.isPublished

  return (
    <Dropdown
      className={styles.dropdown}
      trigger={
        <Button basic>
          <Icon className={styles.ellipsis} name="ellipsis horizontal" />
        </Button>
      }
      inline
      direction="left"
    >
      <Dropdown.Menu>
        <Dropdown.Item text={t('collection_context_menu.see_in_decentraland')} onClick={handleSeeInWorld} />
        <Dropdown.Item text={t('global.open_in_editor')} onClick={handleNavigateToEditor} />

        <Popup
          content={t('collection_context_menu.delete_published_collection')}
          position="right center"
          disabled={canDelete}
          trigger={
            canDelete ? (
              // ConfirmDelete breaks the popup, so we just skip it when unnecessary
              <ConfirmDelete
                name={collection.name}
                onDelete={handleDeleteCollection}
                trigger={<Dropdown.Item text={t('global.delete')} />}
              />
            ) : (
              <Dropdown.Item text={t('global.delete')} disabled />
            )
          }
          hideOnScroll={true}
          on="hover"
          inverted
        />
        <Popup
          content={t('collection_context_menu.change_published_urn')}
          position="right center"
          disabled={!collection.isPublished}
          trigger={<Dropdown.Item text={t('collection_context_menu.edit_urn')} onClick={handleEditURN} disabled={collection.isPublished} />}
          hideOnScroll={true}
          on="hover"
          inverted
        />
        <Dropdown.Item text={t('collection_context_menu.edit_in_bulk')} onClick={handleEditInBulk} />
        <Popup
          content={t('collection_context_menu.unpublished')}
          position="right center"
          disabled={collection.isPublished || !!collection.forumLink}
          trigger={
            <Dropdown.Item
              disabled={!collection.isPublished || !collection.forumLink}
              text={t('collection_context_menu.forum_post')}
              onClick={handleNavigateToForum}
            />
          }
          hideOnScroll={true}
          on="hover"
          inverted
        />
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default CollectionContextMenu
