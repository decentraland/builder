import * as React from 'react'
import { Dropdown, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { isEqual } from 'lib/address'
import ConfirmDelete from 'components/ConfirmDelete'
import CollectionBadge from 'components/CollectionBadge'
import { Props } from './Header.types'
import './Header.css'

export default class Header extends React.PureComponent<Props> {
  handleHome = () => {
    const { onNavigate } = this.props
    onNavigate(locations.avatar())
  }

  handleBack = () => {
    const { onNavigate } = this.props
    onNavigate(locations.itemEditor())
  }

  handleNewItem = () => {
    const { onOpenModal } = this.props
    onOpenModal('CreateItemModal')
  }

  handleNewCollection = () => {
    const { onOpenModal } = this.props
    onOpenModal('CreateCollectionModal')
  }

  handleAddNewItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CreateItemModal', { collectionId: collection!.id })
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
    const { collection, address = '' } = this.props
    const isOwner = collection && isEqual(collection.owner, address)
    return collection ? (
      <>
        <div className="block back" onClick={this.handleBack} />
        <div className="title">
          {collection.name} <CollectionBadge collection={collection} />
        </div>
        {isOwner && !collection.isPublished ? (
          <Dropdown trigger={<div className="block actions" />} inline direction="left">
            <Dropdown.Menu>
              <Dropdown.Item onClick={this.handleEditName}>{t('item_editor.left_panel.actions.edit_name')}</Dropdown.Item>
              <Dropdown.Item onClick={this.handleAddNewItem}>{t('item_editor.left_panel.actions.new_item')}</Dropdown.Item>
              <Dropdown.Item onClick={this.handleAddExistingItem}>{t('item_editor.left_panel.actions.add_existing_item')}</Dropdown.Item>
              <ConfirmDelete name={collection.name} onDelete={this.handleDelete} trigger={<Dropdown.Item text={t('global.delete')} />} />
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <div className="block" />
        )}
      </>
    ) : null
  }

  renderHeader() {
    return (
      <>
        <div className="block home" onClick={this.handleHome} />
        <div className="title">{t('item_editor.left_panel.title')}</div>
        <Dropdown trigger={<div className="block add" />} inline direction="left">
          <Dropdown.Menu>
            <Dropdown.Item onClick={this.handleNewItem}>{t('item_editor.left_panel.actions.new_item')}</Dropdown.Item>
            <Dropdown.Item onClick={this.handleNewCollection}>{t('item_editor.left_panel.actions.new_collection')}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </>
    )
  }

  render() {
    const { collection } = this.props
    return <Row className="Header">{collection ? this.renderSelectedCollection() : this.renderHeader()}</Row>
  }
}
