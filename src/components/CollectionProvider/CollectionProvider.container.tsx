import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnected as isWalletConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { DEFAULT_PAGE_SIZE } from 'lib/api/pagination'
import { RootState } from 'modules/common/types'
import { useGetCollectionIdFromCurrentUrl } from 'modules/location/hooks'
import { getPaginatedCollectionItems, getLoading as getLoadingItems, getCollectionItems } from 'modules/item/selectors'
import { fetchCollectionItemsRequest, FETCH_COLLECTION_ITEMS_REQUEST } from 'modules/item/actions'
import { getLoading, getCollection, getPaginatedCollections } from 'modules/collection/selectors'
import { FETCH_COLLECTION_REQUEST, fetchCollectionRequest } from 'modules/collection/actions'
import { getItemCurations, getLoading as getLoadingItemCurations } from 'modules/curations/itemCuration/selectors'
import { getCuration } from 'modules/curations/collectionCuration/selectors'
import { FETCH_ITEM_CURATIONS_REQUEST } from 'modules/curations/itemCuration/actions'
import { CollectionProviderContainerProps } from './CollectionProvider.types'
import CollectionProvider from './CollectionProvider'

const CollectionProviderContainer: React.FC<CollectionProviderContainerProps> = props => {
  const { id: idProp, itemsPageSize } = props
  const collectionId = useGetCollectionIdFromCurrentUrl()
  const dispatch = useDispatch()

  const id = idProp || collectionId

  const collection = useSelector((state: RootState) => (id ? getCollection(state, id) : null))
  const items = useSelector((state: RootState) => (collection ? getCollectionItems(state, collection.id) : []))
  const paginatedItems = useSelector((state: RootState) =>
    collection ? getPaginatedCollectionItems(state, collection.id, itemsPageSize || DEFAULT_PAGE_SIZE) : []
  )
  const paginatedCollections = useSelector((state: RootState) => getPaginatedCollections(state, itemsPageSize || DEFAULT_PAGE_SIZE) ?? [])
  const itemCurations = useSelector((state: RootState) => (collection ? getItemCurations(state, collection.id) : []))
  const curation = useSelector((state: RootState) => (id ? getCuration(state, id) : null))
  const isConnected = useSelector(isWalletConnected)
  const isLoadingCollection = useSelector((state: RootState) => isLoadingType(getLoading(state), FETCH_COLLECTION_REQUEST))
  const isLoadingCollectionItems = useSelector(
    (state: RootState) =>
      isLoadingType(getLoadingItemCurations(state), FETCH_ITEM_CURATIONS_REQUEST) ||
      isLoadingType(getLoadingItems(state), FETCH_COLLECTION_ITEMS_REQUEST)
  )

  const onFetchCollection: ActionFunction<typeof fetchCollectionRequest> = useCallback(id => {
    dispatch(fetchCollectionRequest(id))
  }, [])
  const onFetchCollectionItems: ActionFunction<typeof fetchCollectionItemsRequest> = useCallback((id, params) => {
    dispatch(fetchCollectionItemsRequest(id, params))
  }, [])

  return (
    <CollectionProvider
      {...props}
      id={id}
      collection={collection}
      items={items}
      paginatedCollections={paginatedCollections}
      paginatedItems={paginatedItems}
      itemCurations={itemCurations}
      curation={curation}
      isConnected={isConnected}
      isLoadingCollection={isLoadingCollection}
      isLoadingCollectionItems={isLoadingCollectionItems}
      onFetchCollection={onFetchCollection}
      onFetchCollectionItems={onFetchCollectionItems}
    />
  )
}

export default CollectionProviderContainer
