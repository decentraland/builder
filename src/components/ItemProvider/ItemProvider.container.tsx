import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { fetchCollectionRequest, FETCH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { RootState } from 'modules/common/types'
import { useGetItemIdFromCurrentUrl } from 'modules/location/hooks'
import { isLoggingIn } from 'modules/identity/selectors'
import { getLoading, getItems } from 'modules/item/selectors'
import { getCollections } from 'modules/collection/selectors'
import { FETCH_ITEM_REQUEST, fetchItemRequest, SAVE_ITEM_REQUEST, SET_PRICE_AND_BENEFICIARY_REQUEST } from 'modules/item/actions'
import { BodyShape } from '@dcl/schemas'
import { clearSpringBones, setBones, setBonesByShape } from 'modules/editor/actions'
import { getBodyShape } from 'modules/editor/selectors'
import { BoneNode } from 'modules/editor/types'
import { ContainerProps } from './ItemProvider.types'
import ItemProvider from './ItemProvider'

const ItemProviderContainer: React.FC<ContainerProps> = ({ id: propId, children }) => {
  const dispatch = useDispatch()
  const idFromUrl = useGetItemIdFromCurrentUrl()
  const id = propId || idFromUrl

  const items = useSelector(getItems)
  const collections = useSelector(getCollections)
  const bodyShape = useSelector(getBodyShape)
  const isWalletConnected = useSelector(isConnected)
  const isLoading = useSelector(
    (state: RootState) =>
      isLoadingType(getLoading(state), FETCH_ITEM_REQUEST) ||
      isLoadingType(getLoading(state), FETCH_COLLECTION_REQUEST) ||
      isLoadingType(getLoading(state), SAVE_ITEM_REQUEST) ||
      isLoadingType(getLoading(state), SET_PRICE_AND_BENEFICIARY_REQUEST) ||
      isLoggingIn(state) ||
      isConnecting(state)
  )

  const item = useMemo(() => items.find(item => item.id === id) || null, [items, id])
  const collection = useMemo(() => {
    if (item && item.collectionId) {
      return collections.find(collection => collection.id === item.collectionId) || null
    }
    return null
  }, [item, collections])

  const onFetchItem: ActionFunction<typeof fetchItemRequest> = useCallback(itemId => dispatch(fetchItemRequest(itemId)), [dispatch])
  const onFetchCollection: ActionFunction<typeof fetchCollectionRequest> = useCallback(
    collectionId => dispatch(fetchCollectionRequest(collectionId)),
    [dispatch]
  )
  const onClearSpringBones = useCallback(() => dispatch(clearSpringBones()), [dispatch])
  const onSetCurrentBones = useCallback((bones: BoneNode[], itemId: string | null) => dispatch(setBones(bones, itemId)), [dispatch])
  const onSetBonesForShape = useCallback(
    (bodyShape: BodyShape, bones: BoneNode[], itemId: string | null) => dispatch(setBonesByShape(bodyShape, bones, itemId)),
    [dispatch]
  )

  return (
    <ItemProvider
      id={id}
      item={item}
      collection={collection}
      bodyShape={bodyShape}
      isLoading={isLoading}
      isConnected={isWalletConnected}
      onFetchItem={onFetchItem}
      onFetchCollection={onFetchCollection}
      onClearSpringBones={onClearSpringBones}
      onSetCurrentBones={onSetCurrentBones}
      onSetBonesForShape={onSetBonesForShape}
    >
      {children}
    </ItemProvider>
  )
}

export default ItemProviderContainer
