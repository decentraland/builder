import * as React from 'react'
import { DragSource } from 'react-dnd'
import { Link } from 'react-router-dom'
import { Button, Card, Confirm } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { OptionsDropdown } from '../../OptionsDropdown'
import { locations } from 'routing/locations'
import ItemImage from 'components/ItemImage'
import { Props } from './ItemCard.types'
import { CollectedProps, ITEM_DASHBOARD_CARD_SOURCE, itemCardSource, collect } from './ItemCard.dnd'
import './ItemCard.css'

const ItemCard = (props: Props & CollectedProps) => {
  const { item, connectDragSource, onDeleteItem, isDragging } = props
  const [isDeleting, setIsDeleting] = React.useState(false)
  const handleCancelDeleteItem = React.useCallback(() => setIsDeleting(false), [setIsDeleting])
  const handleDeleteConfirmation = React.useCallback(() => setIsDeleting(true), [setIsDeleting])

  return (
    <>
      {connectDragSource(
        <div className={`ItemCard is-card ${isDragging ? 'is-dragging' : ''}`}>
          <OptionsDropdown className={'options-dropdown'} options={[{ text: t('global.delete'), handler: handleDeleteConfirmation }]} />
          <Link to={locations.itemDetail(item.id)}>
            <ItemImage item={item} />
            <Card.Content>
              <div className="text" title={item.name}>
                {item.name}
              </div>
              <div className="subtitle">{t(`item.type.${item.type}`)}</div>
            </Card.Content>
          </Link>
        </div>
      )}
      <Confirm
        size="tiny"
        open={isDeleting}
        header={t('item_card.confirm_delete_header', { name: item.name })}
        content={t('item_card.confirm_delete_content', { name: item.name })}
        confirmButton={<Button primary>{t('global.confirm')}</Button>}
        cancelButton={<Button secondary>{t('global.cancel')}</Button>}
        onCancel={handleCancelDeleteItem}
        onConfirm={onDeleteItem}
      />
    </>
  )
}

export default DragSource<Props, CollectedProps>(ITEM_DASHBOARD_CARD_SOURCE, itemCardSource, collect)(React.memo(ItemCard))
