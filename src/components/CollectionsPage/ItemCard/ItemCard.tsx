import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Confirm } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { OptionsDropdown } from '../../OptionsDropdown'
import { locations } from 'routing/locations'
import ItemImage from 'components/ItemImage'
import { Props } from './ItemCard.types'
import './ItemCard.css'

const ItemCard = (props: Props) => {
  const { item, onDeleteItem, onOpenModal } = props
  const [isDeleting, setIsDeleting] = React.useState(false)
  const handleCancelDeleteItem = React.useCallback(() => setIsDeleting(false), [setIsDeleting])
  const handleDeleteConfirmation = React.useCallback(() => setIsDeleting(true), [setIsDeleting])
  const handleMoveToCollection = React.useCallback(() => onOpenModal('MoveItemToCollectionModal'), [])
  const handleDeleteItem = React.useCallback(() => {
    setIsDeleting(false)
    onDeleteItem()
  }, [setIsDeleting, onDeleteItem])

  return (
    <>
      <div className={'ItemCard is-card'}>
        <OptionsDropdown
          className={'options-dropdown'}
          options={[
            { text: t('item_card.move_to_collection'), handler: handleMoveToCollection },
            { text: t('global.delete'), handler: handleDeleteConfirmation }
          ]}
        />
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

      <Confirm
        size="tiny"
        open={isDeleting}
        header={t('item_card.confirm_delete_header', { name: item.name })}
        content={t('item_card.confirm_delete_content', { name: item.name })}
        confirmButton={<Button primary>{t('global.confirm')}</Button>}
        cancelButton={<Button secondary>{t('global.cancel')}</Button>}
        onCancel={handleCancelDeleteItem}
        onConfirm={handleDeleteItem}
      />
    </>
  )
}

export default React.memo(ItemCard)
