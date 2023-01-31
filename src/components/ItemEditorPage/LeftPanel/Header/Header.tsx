import * as React from 'react'
import { Dropdown, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { isEqual } from 'lib/address'
import ConfirmDelete from 'components/ConfirmDelete'
import CollectionStatus from 'components/CollectionStatus'
import { Props } from './Header.types'
import './Header.css'

export default class Header extends React.PureComponent<Props> {
  handleHome = () => {
    const { onNavigate } = this.props
    onNavigate(locations.collections())
  }

  handleBack = () => {
    const { collection, isFromCollections, onNavigate } = this.props
    // If the user came from a collection details page, go back to the same page
    if (isFromCollections) {
      onNavigate(locations.collectionDetail(collection!.id))
    } else {
      onNavigate(locations.itemEditor())
    }
  }

  handleNewItem = () => {
    const { onOpenModal } = this.props
    onOpenModal('CreateSingleItemModal', { changeItemFile: false })
  }

  handleNewCollection = () => {
    const { onOpenModal } = this.props
    onOpenModal('CreateCollectionModal')
  }

  handleAddNewItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CreateSingleItemModal', { collectionId: collection!.id })
  }

  handleAddExistingItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('AddExistingItemModal', { collectionId: collection!.id })
  }

  handleEditName = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('EditCollectionNameModal', { collection })
  }

  handleDelete = () => {
    const { collection, onDeleteCollection } = this.props
    onDeleteCollection(collection!)
  }

  renderSelectedCollection() {
    const { collection, address = '', hasUserOrphanItems, isFromCollections } = this.props
    const isOwner = collection && isEqual(collection.owner, address)
    return collection ? (
      <>
        <div className={`block ${isFromCollections ? 'close' : 'back'}`} onClick={this.handleBack} />
        <div className="title">
          {collection.name} <CollectionStatus collection={collection} />
        </div>
        {isOwner && !collection.isPublished ? (
          <Dropdown trigger={<div className="block actions" />} inline direction="left">
            <Dropdown.Menu>
              <Dropdown.Item onClick={this.handleEditName}>{t('item_editor.left_panel.actions.edit_name')}</Dropdown.Item>
              <Dropdown.Item onClick={this.handleAddNewItem}>{t('item_editor.left_panel.actions.new_item')}</Dropdown.Item>
              {hasUserOrphanItems && (
                <Dropdown.Item onClick={this.handleAddExistingItem}>{t('item_editor.left_panel.actions.add_existing_item')}</Dropdown.Item>
              )}
              <ConfirmDelete name={collection.name} onDelete={this.handleDelete} trigger={<Dropdown.Item text={t('global.delete')} />} />
            </Dropdown.Menu>
          </Dropdown>
        ) : null}
      </>
    ) : null
  }

  renderHeader() {
    const { hasUserOrphanItems, isLoggedIn } = this.props
    return (
      <>
        <div className="block close" onClick={this.handleHome} />
        <div className="title">
          {hasUserOrphanItems ? t('item_editor.left_panel.title') : t('item_editor.left_panel.title_alternative')}
        </div>
        {isLoggedIn ? (
          <Dropdown trigger={<div className="block add" />} inline direction="left">
            <Dropdown.Menu>
              <Dropdown.Item onClick={this.handleNewCollection}>{t('item_editor.left_panel.actions.new_collection')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <div className="block" />
        )}
      </>
    )
  }

  render() {
    const { isReviewing, collection } = this.props
    return isReviewing ? null : (
      <Row grow={false} shrink={false} className="Header">
        {collection ? this.renderSelectedCollection() : this.renderHeader()}
      </Row>
    )
  }
}
