import * as React from 'react'
import { DropTarget } from 'react-dnd'
import { Link } from 'react-router-dom'
import { Button, Card, Confirm } from 'decentraland-ui'
import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionStatus from 'components/CollectionStatus'
import CollectionImage from 'components/CollectionImage'
import { locations } from 'routing/locations'
import { getCollectionType } from 'modules/collection/utils'
import { CollectionType } from 'modules/collection/types'
import { OptionsDropdown } from '../../OptionsDropdown'
import { ITEM_DASHBOARD_CARD_SOURCE } from '../ItemCard/ItemCard.dnd'
import { collect, CollectedProps, collectionTarget } from './CollectionCard.dnd'
import { Props } from './CollectionCard.types'
import './CollectionCard.css'

const CollectionCard = (props: Props & CollectedProps) => {
  const { collection, onDeleteCollection, itemCount, connectDropTarget, isOver, canDrop } = props
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleCancelDeleteCollection = React.useCallback(() => setIsDeleting(false), [setIsDeleting])
  const handleDeleteConfirmation = React.useCallback(() => setIsDeleting(true), [setIsDeleting])
  const handleDeleteCollection = React.useCallback(() => {
    setIsDeleting(false)
    onDeleteCollection()
  }, [setIsDeleting, onDeleteCollection])

  const type = getCollectionType(collection)
  const isThirdParty = type === CollectionType.THIRD_PARTY

  return (
    <>
      {connectDropTarget(
        <div className={`CollectionCard is-card ${isOver && canDrop ? 'is-over' : ''}`}>
          {!collection.isPublished && (
            <OptionsDropdown
              className={classNames({ 'empty-collection-options': itemCount === 0 }, 'options-dropdown')}
              options={[{ text: t('global.delete'), handler: handleDeleteConfirmation }]}
            />
          )}
          <Link to={isThirdParty ? locations.thirdPartyCollectionDetail(collection.id) : locations.collectionDetail(collection.id)}>
            <CollectionImage collectionId={collection.id} />
            <Card.Content>
              <div className="text" title={collection.name}>
                <CollectionStatus collection={collection} /> {collection.name}
              </div>
              <div className="subtitle">
                {t(`collection.type.${type}`)}&nbsp;·&nbsp;
                {t('collection_card.item_count', { count: itemCount })}
              </div>
            </Card.Content>
          </Link>
        </div>
      )}
      <Confirm
        size="tiny"
        open={isDeleting}
        header={t('collection_card.confirm_delete_header', { name: collection.name })}
        content={t('collection_card.confirm_delete_content', { name: collection.name })}
        confirmButton={<Button primary>{t('global.confirm')}</Button>}
        cancelButton={<Button secondary>{t('global.cancel')}</Button>}
        onCancel={handleCancelDeleteCollection}
        onConfirm={handleDeleteCollection}
        className="delete-collection-confirm"
      />
    </>
  )
}

export default DropTarget<Props, CollectedProps>(ITEM_DASHBOARD_CARD_SOURCE, collectionTarget, collect)(React.memo(CollectionCard))
