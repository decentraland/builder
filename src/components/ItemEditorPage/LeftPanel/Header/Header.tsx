import { useCallback } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { Dropdown, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { FromParam, LocationStateProps } from 'modules/location/types'
import { locations } from 'routing/locations'
import { isEqual } from 'lib/address'
import ConfirmDelete from 'components/ConfirmDelete'
import CollectionStatus from 'components/CollectionStatus'
import { Props } from './Header.types'
import './Header.css'

const Header = ({ collection, address, hasUserOrphanItems, isLoggedIn, isReviewing, onOpenModal, onDeleteCollection }: Props) => {
  const location = useLocation()
  const history = useHistory()
  const isFromCollections = (location.state as LocationStateProps)?.fromParam === FromParam.COLLECTIONS
  const isFromTPCollections = (location.state as LocationStateProps)?.fromParam === FromParam.TP_COLLECTIONS

  const handleHome = useCallback(() => {
    history.push(locations.collections())
  }, [history])

  const handleBack = useCallback(() => {
    // If the user came from a collection details page, go back to the same page
    if (collection && (isFromCollections || isFromTPCollections)) {
      const location = isFromCollections ? locations.collectionDetail : locations.thirdPartyCollectionDetail
      history.push(location(collection.id))
    } else {
      history.push(locations.itemEditor())
    }
  }, [isFromCollections, isFromTPCollections, history, collection])

  const handleNewCollection = useCallback(() => {
    onOpenModal('CreateCollectionModal')
  }, [onOpenModal])

  const handleAddNewItem = useCallback(() => {
    collection && onOpenModal('CreateSingleItemModal', { collectionId: collection.id })
  }, [collection, onOpenModal])

  const handleAddExistingItem = useCallback(() => {
    collection && onOpenModal('AddExistingItemModal', { collectionId: collection.id })
  }, [collection, onOpenModal])

  const handleEditName = useCallback(() => {
    collection && onOpenModal('EditCollectionNameModal', { collection })
  }, [collection, onOpenModal])

  const handleDelete = useCallback(() => {
    collection && onDeleteCollection(collection)
  }, [collection, onDeleteCollection])

  const renderSelectedCollection = useCallback(() => {
    const isOwner = collection && isEqual(collection.owner, address || '')
    return collection ? (
      <>
        <div className={`block ${isFromCollections || isFromTPCollections ? 'close' : 'back'}`} onClick={handleBack} />
        <div className="title">
          <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link>
          <CollectionStatus collection={collection} />
        </div>
        {isOwner && !collection.isPublished ? (
          <Dropdown trigger={<div className="block actions" />} inline direction="left">
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleEditName}>{t('item_editor.left_panel.actions.edit_name')}</Dropdown.Item>
              <Dropdown.Item onClick={handleAddNewItem}>{t('item_editor.left_panel.actions.new_item')}</Dropdown.Item>
              {hasUserOrphanItems && (
                <Dropdown.Item onClick={handleAddExistingItem}>{t('item_editor.left_panel.actions.add_existing_item')}</Dropdown.Item>
              )}
              <ConfirmDelete name={collection.name} onDelete={handleDelete} trigger={<Dropdown.Item text={t('global.delete')} />} />
            </Dropdown.Menu>
          </Dropdown>
        ) : null}
      </>
    ) : null
  }, [collection, address, hasUserOrphanItems, isFromCollections, isFromTPCollections])

  const renderHeader = useCallback(() => {
    return (
      <>
        <div className="block close" onClick={handleHome} />
        <div className="title">
          {hasUserOrphanItems ? t('item_editor.left_panel.title') : t('item_editor.left_panel.title_alternative')}
        </div>
        {isLoggedIn ? (
          <Dropdown trigger={<div className="block add" />} inline direction="left">
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleNewCollection}>{t('item_editor.left_panel.actions.new_collection')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <div className="block" />
        )}
      </>
    )
  }, [hasUserOrphanItems, isLoggedIn])

  return isReviewing ? null : (
    <Row grow={false} shrink={false} className="Header">
      {collection ? renderSelectedCollection() : renderHeader()}
    </Row>
  )
}

export default Header
