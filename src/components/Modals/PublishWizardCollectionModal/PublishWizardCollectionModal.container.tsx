import { useCallback, useEffect, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AuthorizationStepStatus } from 'decentraland-ui'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getCredits, isFetchingCredits } from 'decentraland-dapps/dist/modules/credits/selectors'
import { fetchCreditsRequest } from 'decentraland-dapps/dist/modules/credits/actions'
import { CreditsResponse } from 'decentraland-dapps/dist/modules/credits/types'
import { RootState } from 'modules/common/types'
import {
  getCollection,
  getLoading as getCollectionLoading,
  getUnsyncedCollectionError,
  getError as getCollectionError,
  getPublishStatus
} from 'modules/collection/selectors'
import {
  getLoading as getItemLoading,
  getCollectionItems,
  getError as getItemError,
  getRarities,
  getUnpublishedThirdPartyItemsById,
  getUnsyncedThirdPartyItemsById
} from 'modules/item/selectors'
import { publishCollectionRequest } from 'modules/collection/actions'
import { CREATE_COLLECTION_FORUM_POST_REQUEST } from 'modules/forum/actions'
import { fetchRaritiesRequest, FETCH_RARITIES_REQUEST, FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import {
  getIsOffchainPublicItemOrdersEnabled,
  getIsPublishCollectionsWertEnabled,
  getIsCreditsForCollectionsFeeEnabled
} from 'modules/features/selectors'
import { OwnProps } from './PublishWizardCollectionModal.types'
import { AuthorizedPublishWizardThirdPartyCollectionModal, AuthorizedPublishWizardCollectionModal } from './PublishWizardCollectionModal'
import { isTPCollection } from 'modules/collection/utils'
import { PaymentMethod } from 'modules/collection/types'
import { Cheque } from 'modules/thirdParty/types'
import { publishAndPushChangesThirdPartyItemsRequest } from 'modules/thirdParty/actions'
import { getCollectionThirdParty, getError as getThirdPartyError, getThirdPartyPublishStatus } from 'modules/thirdParty/selectors'
import { useThirdPartyPrice } from './hooks'

export default (props: OwnProps) => {
  const dispatch = useDispatch()
  const { thirdPartyPrice, isFetchingPrice, fetchThirdPartyPrice } = useThirdPartyPrice()
  const collection = useSelector((state: RootState) => getCollection(state, props.metadata.collectionId), shallowEqual)!

  const isFetchingItems = useSelector((state: RootState) => isLoadingType(getItemLoading(state), FETCH_ITEMS_REQUEST), shallowEqual)
  const isFetchingRarities = useSelector((state: RootState) => isLoadingType(getItemLoading(state), FETCH_RARITIES_REQUEST), shallowEqual)
  const isCreatingForumPost = useSelector(
    (state: RootState) => isLoadingType(getCollectionLoading(state), CREATE_COLLECTION_FORUM_POST_REQUEST),
    shallowEqual
  )
  const standardPublishingStatus = useSelector((state: RootState) => getPublishStatus(state), shallowEqual)
  const thirdPartyPublishingStatus = useSelector((state: RootState) => getThirdPartyPublishStatus(state), shallowEqual)

  const isOffchainPublicItemOrdersEnabled = useSelector((state: RootState) => getIsOffchainPublicItemOrdersEnabled(state))
  const isPublishCollectionsWertEnabled = useSelector(getIsPublishCollectionsWertEnabled, shallowEqual)
  const isCreditsForCollectionsFeeEnabled = useSelector(getIsCreditsForCollectionsFeeEnabled, shallowEqual)
  const wallet = useSelector(getWallet, shallowEqual)!
  const unsyncedCollectionError = useSelector(getUnsyncedCollectionError, shallowEqual)
  const allCollectionItems = useSelector((state: RootState) => getCollectionItems(state, props.metadata.collectionId), shallowEqual)
  const rarities = useSelector(getRarities, shallowEqual)
  const itemError = useSelector(getItemError, shallowEqual)
  const collectionError = useSelector(getCollectionError, shallowEqual)
  const thirdPartyPublishingError = useSelector(getThirdPartyError, shallowEqual)
  const isThirdParty = useMemo(() => collection && isTPCollection(collection), [collection])
  const thirdParty = useSelector(
    (state: RootState) => (collection && isThirdParty ? getCollectionThirdParty(state, collection) : null),
    shallowEqual
  )

  const itemIdsToPublish = useMemo(() => (props.metadata.itemsToPublish ?? []).map(item => item.id), [props.metadata.itemsToPublish])
  const thirdPartyItemsToPublish = useSelector(
    (state: RootState) => getUnpublishedThirdPartyItemsById(state, itemIdsToPublish),
    shallowEqual
  )
  const thirdPartyItemsToPushChanges = useSelector(
    (state: RootState) =>
      getUnsyncedThirdPartyItemsById(
        state,
        (props.metadata.itemsWithChanges ?? []).map(item => item.id)
      ),
    shallowEqual
  )

  const itemsToPublish = thirdParty ? thirdPartyItemsToPublish : allCollectionItems
  const itemsWithChanges = thirdPartyItemsToPushChanges

  const price = useMemo(() => {
    if (thirdParty) {
      return thirdPartyPrice
    } else if (rarities[0]?.prices?.USD && rarities[0]?.prices?.MANA) {
      // The UI is designed in a way that considers that all rarities have the same price, so only using the first one
      // as reference for the prices is enough.
      return { item: { usd: rarities[0].prices.USD, mana: rarities[0].prices.MANA } }
    }
  }, [thirdParty, thirdPartyPrice, rarities[0]?.prices?.USD, rarities[0]?.prices?.MANA])

  const onFetchRarities = useCallback(() => dispatch(fetchRaritiesRequest()), [dispatch, fetchRaritiesRequest])

  const onPublish = useCallback(
    (
      email: string,
      subscribeToNewsletter: boolean,
      paymentMethod: PaymentMethod,
      cheque?: Cheque,
      maxSlotPrice?: string,
      minSlots?: string,
      creditsAmount = '0'
    ) => {
      return thirdParty
        ? dispatch(
            publishAndPushChangesThirdPartyItemsRequest(
              thirdParty,
              itemsToPublish,
              itemsWithChanges,
              cheque,
              email,
              subscribeToNewsletter,
              maxSlotPrice,
              minSlots
            )
          )
        : dispatch(publishCollectionRequest(collection, itemsToPublish, email, subscribeToNewsletter, paymentMethod, creditsAmount))
    },
    [
      thirdParty,
      collection,
      itemsToPublish,
      itemsWithChanges,
      dispatch,
      publishAndPushChangesThirdPartyItemsRequest,
      publishCollectionRequest
    ]
  )

  const address = useSelector(getAddress)
  const credits = useSelector((state: RootState) => (address ? getCredits(state, address) : null) as CreditsResponse | null, shallowEqual)
  const isLoadingCredits = useSelector(isFetchingCredits, shallowEqual)

  // Fetch credits when the component mounts
  useEffect(() => {
    if (address && !credits) {
      dispatch(fetchCreditsRequest(address))
    }
  }, [address, credits, dispatch])

  const isPublishingFinished = !!collection.forumLink && thirdPartyItemsToPublish.length === 0 && thirdPartyItemsToPushChanges.length === 0
  const publishingStatus = thirdParty ? thirdPartyPublishingStatus : standardPublishingStatus
  const isPublishing = publishingStatus === AuthorizationStepStatus.WAITING || publishingStatus === AuthorizationStepStatus.PROCESSING
  const PublishWizardCollectionModal = useMemo(
    () => (thirdParty ? AuthorizedPublishWizardThirdPartyCollectionModal : AuthorizedPublishWizardCollectionModal),
    [thirdParty]
  )

  return (
    <PublishWizardCollectionModal
      {...props}
      collection={collection}
      isLoading={isPublishing || isFetchingItems || isFetchingRarities || isCreatingForumPost || isFetchingPrice || !!collection.lock}
      publishingStatus={publishingStatus}
      wallet={wallet}
      itemsToPublish={itemsToPublish}
      itemsWithChanges={itemsWithChanges}
      isPublishingFinished={isPublishingFinished}
      price={price}
      credits={credits}
      isLoadingCredits={isLoadingCredits}
      unsyncedCollectionError={unsyncedCollectionError}
      itemError={itemError}
      collectionError={collectionError || thirdPartyPublishingError}
      isPublishCollectionsWertEnabled={isPublishCollectionsWertEnabled}
      isCreditsForCollectionsFeeEnabled={isCreditsForCollectionsFeeEnabled}
      isOffchainPublicItemOrdersEnabled={isOffchainPublicItemOrdersEnabled}
      onPublish={onPublish}
      onFetchPrice={isThirdParty ? fetchThirdPartyPrice : onFetchRarities}
      thirdParty={thirdParty}
    />
  )
}
