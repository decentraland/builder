import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { useGetItemIdFromCurrentUrl } from 'modules/location/hooks'
import { getCollection } from 'modules/collection/selectors'
import { getItem, getLoading, getStatusByItemId, hasViewAndEditRights } from 'modules/item/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { FETCH_ITEMS_REQUEST, DELETE_ITEM_REQUEST, deleteItemRequest, saveItemRequest, SAVE_ITEM_REQUEST } from 'modules/item/actions'
import { getIsWearableUtilityEnabled } from 'modules/features/selectors'
import ItemDetailPage from './ItemDetailPage'

const ItemDetailPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const itemId = useGetItemIdFromCurrentUrl()

  const wallet = useSelector(getWallet)
  const item = useSelector((state: RootState) => (itemId ? getItem(state, itemId) : null))
  const collection = useSelector((state: RootState) => (item && item.collectionId ? getCollection(state, item.collectionId) : null))
  const statusByItemId = useSelector(getStatusByItemId)
  const loading = useSelector(getLoading)
  const isWearableUtilityEnabled = useSelector(getIsWearableUtilityEnabled)

  const status = item ? statusByItemId[item.id] : null
  const isLoading =
    isLoadingType(loading, FETCH_ITEMS_REQUEST) || isLoadingType(loading, DELETE_ITEM_REQUEST) || isLoadingType(loading, SAVE_ITEM_REQUEST)
  const hasAccess = useSelector((state: RootState) => item !== null && hasViewAndEditRights(state, wallet!.address, collection, item))

  const onSaveItem: ActionFunction<typeof saveItemRequest> = useCallback(
    (item, contents) => dispatch(saveItemRequest(item, contents)),
    [dispatch]
  )
  const onDelete: ActionFunction<typeof deleteItemRequest> = useCallback(item => dispatch(deleteItemRequest(item)), [dispatch])
  const onOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])

  return (
    <ItemDetailPage
      itemId={itemId}
      wallet={wallet!}
      item={item}
      collection={collection}
      status={status}
      isLoading={isLoading}
      isWearableUtilityEnabled={isWearableUtilityEnabled}
      hasAccess={hasAccess}
      onSaveItem={onSaveItem}
      onDelete={onDelete}
      onOpenModal={onOpenModal}
    />
  )
}

export default ItemDetailPageContainer
