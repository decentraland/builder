import * as React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Dropdown, Button, Icon, Popup, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { buildCollectionForumPost } from 'modules/forum/utils'
import ConfirmDelete from 'components/ConfirmDelete'
import { Props } from './ContextMenu.types'
import './ContextMenu.css'

export default class ContextMenu extends React.PureComponent<Props> {
  handleNavigateToForum = () => {
    const { collection } = this.props
    if (collection.isPublished && collection.forumLink) {
      this.navigateTo(collection.forumLink, '_blank')
    }
  }

  handlePostToForum = () => {
    const { collection, items, onPostToForum } = this.props
    if (!collection.forumLink) {
      onPostToForum(collection, buildCollectionForumPost(collection, items))
    }
  }

  handleUpdateManagers = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CollectionManagersModal', { collectionId: collection.id })
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
    const { collection, isForumPostLoading } = this.props
    return (
      <Dropdown
        className="ContextMenu"
        trigger={
          <Button basic>
            <Icon name="ellipsis horizontal" />
          </Button>
        }
        inline
        direction="left"
      >
        <Dropdown.Menu>
          {collection.isPublished ? (
            <Dropdown.Item text={t('context_menu.managers')} onClick={this.handleUpdateManagers} />
          ) : (
            <>
              <Dropdown.Item text={t('context_menu.add_existing_item')} onClick={this.handleAddExistingItem} />
              <ConfirmDelete
                name={collection.name}
                onDelete={this.handleDeleteItem}
                trigger={<Dropdown.Item text={t('global.delete')} />}
              />
            </>
          )}

          <Popup
            content={
              !collection.isPublished ? t('context_menu.unpublished') : !collection.forumLink ? t('context_menu.not_posted') : undefined
            }
            disabled={collection.isPublished || !!collection.forumLink}
            position="right center"
            trigger={
              !collection.isPublished || collection.forumLink ? (
                <Dropdown.Item
                  disabled={!collection.isPublished}
                  text={t('context_menu.forum_post')}
                  onClick={this.handleNavigateToForum}
                />
              ) : (
                <Dropdown.Item onClick={this.handlePostToForum} disabled={isForumPostLoading}>
                  {isForumPostLoading ? (
                    <div>
                      {t('context_menu.posting')}&nbsp;&nbsp;
                      <Loader size="mini" active inline />
                    </div>
                  ) : (
                    t('context_menu.post_to_forum')
                  )}
                </Dropdown.Item>
              )
            }
            hideOnScroll={true}
            on="hover"
            inverted
            flowing
          />
          <Popup
            content={t('context_menu.unpublished')}
            position="right center"
            disabled={collection.isPublished}
            trigger={
              <CopyToClipboard text={collection.contractAddress!}>
                <Dropdown.Item disabled={!collection.isPublished} text={t('context_menu.copy_address')} />
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
