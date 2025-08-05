import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { useGetCollectionIdFromCurrentUrl } from 'modules/location/hooks'
import { getCollection, isOnSaleLoading, getLoading as getLoadingCollection, getStatusByCollectionId } from 'modules/collection/selectors'
import { DELETE_COLLECTION_REQUEST, SET_COLLECTION_MINTERS_REQUEST } from 'modules/collection/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getCollectionItems } from 'modules/item/selectors'
import { getLastLocation } from 'modules/ui/location/selector'
import { fetchCollectionForumPostReplyRequest, FETCH_COLLECTION_FORUM_POST_REPLY_REQUEST } from 'modules/forum/actions'
import CollectionDetailPage from './CollectionDetailPage'

const CollectionDetailPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const collectionId = useGetCollectionIdFromCurrentUrl() || ''

  const wallet = useSelector(getWallet)
  const collection = useSelector((state: RootState) => getCollection(state, collectionId))
  const statusByCollectionId = useSelector(getStatusByCollectionId)
  const isOnSaleLoadingSelector = useSelector(isOnSaleLoading)
  const loadingCollection = useSelector(getLoadingCollection)
  const items = useSelector((state: RootState) => getCollectionItems(state, collectionId))
  const lastLocation = useSelector(getLastLocation)

  const isOnSaleLoadingComputed = useMemo(
    () => isOnSaleLoadingSelector || isLoadingType(loadingCollection, SET_COLLECTION_MINTERS_REQUEST),
    [isOnSaleLoadingSelector, loadingCollection]
  )
  const status = statusByCollectionId[collectionId]
  const isLoading =
    isLoadingType(loadingCollection, DELETE_COLLECTION_REQUEST) ||
    isLoadingType(loadingCollection, FETCH_COLLECTION_FORUM_POST_REPLY_REQUEST)

  const onOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])
  const onFetchCollectionForumPostReply: ActionFunction<typeof fetchCollectionForumPostReplyRequest> = useCallback(
    id => dispatch(fetchCollectionForumPostReplyRequest(id)),
    [dispatch]
  )

  return (
    <CollectionDetailPage
      wallet={wallet!}
      collection={collection}
      isOnSaleLoading={isOnSaleLoadingComputed}
      isLoading={isLoading}
      items={items}
      status={status}
      lastLocation={lastLocation}
      onOpenModal={onOpenModal}
      onFetchCollectionForumPostReply={onFetchCollectionForumPostReply}
    />
  )
}

export default CollectionDetailPageContainer
