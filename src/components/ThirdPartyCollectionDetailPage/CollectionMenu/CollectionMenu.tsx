import * as React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Dropdown, Button, Icon, Popup, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { buildCollectionForumPost } from 'modules/forum/utils'
import { RoleType } from 'modules/collection/types'
import { getCollectionEditorURL, getExplorerURL, isOwner as isCollectionOwner, isLocked } from 'modules/collection/utils'
import ConfirmDelete from 'components/ConfirmDelete'
import { Props } from './CollectionMenu.types'
import './CollectionMenu.css'

export default class CollectionMenu extends React.PureComponent<Props> {
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

  handlePostToForum = () => {
    const { collection, items, name, onPostToForum } = this.props
    if (!collection.forumLink) {
      onPostToForum(collection, buildCollectionForumPost(collection, items, name))
    }
  }

  handleUpdateManagers = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('ManageCollectionRoleModal', { type: RoleType.MANAGER, collectionId: collection.id, roles: collection.managers })
  }

  handleUpdateMinters = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('ManageCollectionRoleModal', { type: RoleType.MINTER, collectionId: collection.id, roles: collection.minters })
  }

  handleAddExistingItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('AddExistingItemModal', { collectionId: collection.id })
  }

  handleDeleteItem = () => {
    const { collection, onDelete } = this.props
    onDelete(collection)
  }

  navigateTo = (url: string, target: string = '') => {
    const newWindow = window.open(url, target)
    if (newWindow) {
      newWindow.focus()
    }
  }

  render() {
    const { collection, wallet, isForumPostLoading } = this.props
    const isOwner = isCollectionOwner(collection, wallet.address)
    return (
      <Dropdown
        className="CollectionMenu"
        trigger={
          <Button basic>
            <Icon name="ellipsis horizontal" />
          </Button>
        }
        inline
        direction="left"
      >
        <Dropdown.Menu>
          <Dropdown.Item text={t('collection_menu.see_in_world')} onClick={this.handleNavigateToExplorer} />
          <Dropdown.Item text={t('collection_menu.open_in_editor')} onClick={this.handleNavigateToEditor} />

          {collection.isPublished ? (
            isOwner ? (
              <>
                <Dropdown.Item text={t('collection_menu.managers')} onClick={this.handleUpdateManagers} />
                <Dropdown.Item text={t('collection_menu.minters')} onClick={this.handleUpdateMinters} />
              </>
            ) : null
          ) : !isLocked(collection) ? (
            <>
              <Dropdown.Item text={t('collection_menu.add_existing_item')} onClick={this.handleAddExistingItem} />
              <ConfirmDelete
                name={collection.name}
                onDelete={this.handleDeleteItem}
                trigger={<Dropdown.Item text={t('global.delete')} />}
              />
            </>
          ) : null}

          <Popup
            content={
              !collection.isPublished
                ? t('collection_menu.unpublished')
                : !collection.forumLink
                ? t('collection_menu.not_posted')
                : undefined
            }
            disabled={collection.isPublished || !!collection.forumLink}
            position="right center"
            trigger={
              !collection.isPublished || collection.forumLink ? (
                <Dropdown.Item
                  disabled={!collection.isPublished}
                  text={t('collection_menu.forum_post')}
                  onClick={this.handleNavigateToForum}
                />
              ) : isOwner ? (
                <Dropdown.Item onClick={this.handlePostToForum} disabled={isForumPostLoading}>
                  {isForumPostLoading ? (
                    <div>
                      {t('collection_menu.posting')}&nbsp;&nbsp;
                      <Loader size="mini" active inline />
                    </div>
                  ) : (
                    t('collection_menu.post_to_forum')
                  )}
                </Dropdown.Item>
              ) : null
            }
            hideOnScroll={true}
            on="hover"
            inverted
            flowing
          />

          <Popup
            content={t('collection_menu.unpublished')}
            position="right center"
            disabled={collection.isPublished}
            trigger={
              <CopyToClipboard text={collection.contractAddress!}>
                <Dropdown.Item disabled={!collection.isPublished} text={t('collection_menu.copy_address')} />
              </CopyToClipboard>
            }
            hideOnScroll={true}
            on="hover"
            inverted
            flowing
          />
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
