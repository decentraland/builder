import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { RootState } from 'modules/common/types'
import { useGetCollectionIdFromCurrentUrl, useGetCurrentPageFromCurrentUrl } from 'modules/location/hooks'
import { getCollection, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getCollectionItems, getPaginationData } from 'modules/item/selectors'
import { DELETE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { getCollectionThirdParty, isFetchingAvailableSlots, isLoadingThirdParties, isLoadingThirdParty } from 'modules/thirdParty/selectors'
import { fetchThirdPartyAvailableSlotsRequest, fetchThirdPartyRequest } from 'modules/thirdParty/actions'
import { isThirdPartyCollection } from 'modules/collection/utils'
import { getIsLinkedWearablesPaymentsEnabled, getIsLinkedWearablesV2Enabled } from 'modules/features/selectors'
import { getLastLocation } from 'modules/ui/location/selector'
import { extractThirdPartyId } from 'lib/urn'
import { Collection } from 'modules/collection/types'
import ThirdPartyCollectionDetailPage from './ThirdPartyCollectionDetailPage'

const ThirdPartyCollectionDetailPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const collectionId = useGetCollectionIdFromCurrentUrl() || ''
  const currentPage = useGetCurrentPageFromCurrentUrl()

  const collection = useSelector((state: RootState) => getCollection(state, collectionId))
  const isThirdParty = useMemo(() => (collection ? isThirdPartyCollection(collection) : false), [collection])
  const totalItems = useSelector((state: RootState) => getPaginationData(state, collectionId)?.total || null)
  const items = useSelector((state: RootState) => (collection ? getCollectionItems(state, collection.id) : []))
  const paginatedData = useSelector((state: RootState) => (collection && getPaginationData(state, collection.id)) || null)
  const wallet = useSelector(getWallet)!
  const isThirdPartyV2Enabled = useSelector(getIsLinkedWearablesV2Enabled)
  const isLinkedWearablesPaymentsEnabled = useSelector(getIsLinkedWearablesPaymentsEnabled)
  const thirdParty = useSelector((state: RootState) =>
    collection && isThirdPartyCollection(collection) ? getCollectionThirdParty(state, collection) : null
  )
  const authorizations = useSelector((state: RootState) => getAuthorizations(state))
  const isLoading = useSelector(
    (state: RootState) =>
      isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST) ||
      isLoadingThirdParties(state) ||
      !!(isThirdParty && collection && isLoadingThirdParty(state, extractThirdPartyId(collection.urn)))
  )
  const isLoadingAvailableSlots = useSelector((state: RootState) => isFetchingAvailableSlots(state))
  const lastLocation = useSelector((state: RootState) => getLastLocation(state))

  const onNewItem = useCallback((collectionId: string) => dispatch(openModal('CreateItemsModal', { collectionId })), [dispatch])
  const onEditName = useCallback((collection: Collection) => dispatch(openModal('EditCollectionNameModal', { collection })), [dispatch])
  const onFetchAvailableSlots: ActionFunction<typeof fetchThirdPartyAvailableSlotsRequest> = useCallback(
    (thirdPartyId: string) => dispatch(fetchThirdPartyAvailableSlotsRequest(thirdPartyId)),
    [dispatch]
  )
  const onFetchThirdParty: ActionFunction<typeof fetchThirdPartyRequest> = useCallback(
    thirdPartyId => dispatch(fetchThirdPartyRequest(thirdPartyId)),
    [dispatch]
  )

  return (
    <ThirdPartyCollectionDetailPage
      items={items}
      totalItems={totalItems}
      currentPage={currentPage}
      paginatedData={paginatedData}
      wallet={wallet}
      collection={collection}
      isThirdPartyV2Enabled={isThirdPartyV2Enabled}
      isLinkedWearablesPaymentsEnabled={isLinkedWearablesPaymentsEnabled}
      thirdParty={thirdParty}
      authorizations={authorizations}
      isLoading={isLoading}
      isLoadingAvailableSlots={isLoadingAvailableSlots}
      lastLocation={lastLocation}
      onNewItem={onNewItem}
      onEditName={onEditName}
      onFetchAvailableSlots={onFetchAvailableSlots}
      onFetchThirdParty={onFetchThirdParty}
    />
  )
}

export default ThirdPartyCollectionDetailPageContainer
