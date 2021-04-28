import * as React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Dropdown, Button, Icon, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ConfirmDelete from 'components/ConfirmDelete'
import { Props } from './ContextMenu.types'
import { getTransactionHref } from 'decentraland-dapps/dist/modules/transaction/utils'
import './ContextMenu.css'

export default class ContextMenu extends React.PureComponent<Props> {
  handleNavigateToForum = () => {
    const { collection } = this.props
    if (collection.isPublished && collection.forumLink) {
      this.navigateTo(collection.forumLink, '_blank')
    }
  }

  handleNavigateToAddress = () => {
    const { collection } = this.props
    if (collection.isPublished) {
      const url = getTransactionHref({ address: collection.contractAddress })
      this.navigateTo(url, '_blank')
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
    const { collection } = this.props
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
            <Dropdown.Item text={t('collection_detail_page.managers')} onClick={this.handleUpdateManagers} />
          ) : (
            <>
              <Dropdown.Item text={t('collection_detail_page.add_existing_item')} onClick={this.handleAddExistingItem} />
              <ConfirmDelete
                name={collection.name}
                onDelete={this.handleDeleteItem}
                trigger={<Dropdown.Item text={t('global.delete')} />}
              />
            </>
          )}

          <Popup
            content={t('collection_detail_page.unpublished')}
            position="right center"
            disabled={collection.isPublished}
            trigger={
              <Dropdown.Item
                disabled={!collection.isPublished}
                text={t('collection_detail_page.forum_post')}
                onClick={this.handleNavigateToForum}
              />
            }
            hideOnScroll={true}
            on="hover"
            inverted
            flowing
          />
          <Popup
            content={t('collection_detail_page.unpublished')}
            position="right center"
            disabled={collection.isPublished}
            trigger={
              <CopyToClipboard text={collection.contractAddress!}>
                <Dropdown.Item disabled={!collection.isPublished} text={t('collection_detail_page.copy_address')} />
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
