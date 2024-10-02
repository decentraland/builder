import { useCallback } from 'react'
import { AuthorizationStepStatus } from 'decentraland-ui'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getCollection, getError as getCollectionError, getLoading as getCollectionLoading } from 'modules/collection/selectors'
import { getCollectionThirdParty, getError as getThirdPartyError, getThirdPartyPublishStatus } from 'modules/thirdParty/selectors'
import { PUSH_COLLECTION_CURATION_REQUEST, pushCollectionCurationRequest } from 'modules/curations/collectionCuration/actions'
import { isThirdPartyCollection } from 'modules/collection/utils'
import { RootState } from 'modules/common/types'
import { publishAndPushChangesThirdPartyItemsRequest } from 'modules/thirdParty/actions'
import { OwnProps } from './PushChangesModal.types'
import { PushChangesModal } from './PushChangesModal'

export default (props: OwnProps) => {
  const dispatch = useDispatch()
  const isPushingStandardCollectionChanges = useSelector((store: RootState) =>
    isLoadingType(getCollectionLoading(store), PUSH_COLLECTION_CURATION_REQUEST)
  )
  const thirdPartyPublishStatus = useSelector((store: RootState) => getThirdPartyPublishStatus(store), shallowEqual)
  const isPushingThirdPartyItemsChanges =
    thirdPartyPublishStatus === AuthorizationStepStatus.WAITING || thirdPartyPublishStatus === AuthorizationStepStatus.PROCESSING

  const collection = useSelector((state: RootState) => getCollection(state, props.metadata.collectionId), shallowEqual)
  const thirdPartyError = useSelector((state: RootState) => getThirdPartyError(state), shallowEqual)
  const collectionError = useSelector((state: RootState) => getCollectionError(state), shallowEqual)
  const error = thirdPartyError || collectionError
  if (!collection) {
    throw new Error('Collection not found')
  }

  const isThirdParty = isThirdPartyCollection(collection)
  const thirdParty = isThirdParty ? useSelector((store: RootState) => getCollectionThirdParty(store, collection)) : null
  const isLoading = isPushingStandardCollectionChanges || isPushingThirdPartyItemsChanges
  const onPushChanges = useCallback(
    (email: string, subscribeToNewsletter: boolean) => {
      if (thirdParty) {
        dispatch(
          publishAndPushChangesThirdPartyItemsRequest(
            thirdParty,
            [],
            props.metadata.itemsWithChanges,
            undefined,
            email,
            subscribeToNewsletter
          )
        )
      } else {
        dispatch(pushCollectionCurationRequest(props.metadata.collectionId))
      }
    },
    [dispatch, props.metadata.collectionId, thirdParty, props.metadata.itemsWithChanges]
  )

  return <PushChangesModal {...props} isLoading={isLoading} error={error} onPushChanges={onPushChanges} collection={collection} />
}
