import * as React from 'react'
import { Dropdown, Button, Icon, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getCollectionEditorURL, getExplorerURL, isLocked } from 'modules/collection/utils'
import { CreateOrEditMultipleItemsModalType } from 'components/Modals/CreateMultipleItemsModal/CreateMultipleItemsModal.types'
import ConfirmDelete from 'components/ConfirmDelete'
import { Props } from './CollectionContextMenu.types'
import styles from './CollectionContextMenu.module.css'

export default class CollectionContextMenu extends React.PureComponent<Props> {
  handleNavigateToForum = () => {
    const { collection } = this.props
    if (collection.isPublished && collection.forumLink) {
      this.navigateTo(collection.forumLink, '_blank')
    }
  }

  handleNavigateToExplorer = () => {
    const { collection } = this.props
    this.navigateTo(getExplorerURL(collection), '_blank')
  }

  handleNavigateToEditor = () => {
    const { collection, items, onNavigate } = this.props
    onNavigate(getCollectionEditorURL(collection, items))
  }

  handleDeleteCollection = () => {
    const { collection, onDelete } = this.props
    onDelete(collection)
  }

  handleEditURN = () => {
    const { collection, onOpenModal } = this.props
    if (!collection.isPublished) {
      onOpenModal('EditCollectionURNModal', { collection })
    }
  }

  handleEditInBulk = () => {
    const { collection, onOpenModal } = this.props
    if (!collection.isPublished) {
      onOpenModal('CreateMultipleItemsModal', { collectionId: collection.id, type: CreateOrEditMultipleItemsModalType.EDIT })
    }
  }

  navigateTo = (url: string, target: string = '') => {
    const newWindow = window.open(url, target)
    if (newWindow) {
      newWindow.focus()
    }
  }

  canDelete() {
    const { collection } = this.props
    return !isLocked(collection) && !collection.isPublished
  }

  render() {
    const { collection } = this.props
    const canDelete = this.canDelete()
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
          <Dropdown.Item text={t('collection_context_menu.see_in_world')} onClick={this.handleNavigateToExplorer} />
          <Dropdown.Item text={t('global.open_in_editor')} onClick={this.handleNavigateToEditor} />

          <Popup
            content={t('collection_context_menu.delete_published_collection')}
            position="right center"
            disabled={canDelete}
            trigger={
              canDelete ? (
                // ConfirmDelete breaks the popup, so we just skip it when unnecessary
                <ConfirmDelete
                  name={collection.name}
                  onDelete={this.handleDeleteCollection}
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
            trigger={
              <Dropdown.Item text={t('collection_context_menu.edit_urn')} onClick={this.handleEditURN} disabled={collection.isPublished} />
            }
            hideOnScroll={true}
            on="hover"
            inverted
          />
          <Dropdown.Item text={t('collection_context_menu.edit_in_bulk')} onClick={this.handleEditInBulk} />
          <Popup
            content={t('collection_context_menu.unpublished')}
            position="right center"
            disabled={collection.isPublished || !!collection.forumLink}
            trigger={
              <Dropdown.Item
                disabled={!collection.isPublished || !collection.forumLink}
                text={t('collection_context_menu.forum_post')}
                onClick={this.handleNavigateToForum}
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
}
