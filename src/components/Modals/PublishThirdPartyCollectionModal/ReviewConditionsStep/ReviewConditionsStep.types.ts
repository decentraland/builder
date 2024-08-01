import { Dispatch } from 'redux'
import { ThirdParty } from 'modules/thirdParty/types'
import { Item, SyncStatus } from 'modules/item/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import {
  publishAndPushChangesThirdPartyItemsRequest,
  PublishAndPushChangesThirdPartyItemsRequestAction,
  publishThirdPartyItemsRequest,
  PublishThirdPartyItemsRequestAction,
  pushChangesThirdPartyItemsRequest,
  PushChangesThirdPartyItemsRequestAction
} from 'modules/thirdParty/actions'

export type Props = {
  thirdParty: ThirdParty | null
  items: Item[]
  itemCurations: ItemCuration[]
  itemsStatus: Record<string, SyncStatus>
  onGoToNextStep: () => unknown
  onPublish: (...args: Parameters<typeof publishThirdPartyItemsRequest>) => unknown
  onPushChanges: (...args: Parameters<typeof pushChangesThirdPartyItemsRequest>) => unknown
  onPublishAndPushChanges: (...args: Parameters<typeof publishAndPushChangesThirdPartyItemsRequest>) => unknown
  onClose: () => unknown
  collectionId: string
  itemIds: string[]
  action: PublishButtonAction
}

export type OwnProps = Pick<Props, 'collectionId' | 'itemIds' | 'action' | 'onClose' | 'onGoToNextStep'>
export type MapStateProps = Pick<Props, 'items' | 'thirdParty' | 'itemsStatus' | 'itemCurations'>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onPushChanges' | 'onPublishAndPushChanges'>
export type MapDispatch = Dispatch<
  PublishThirdPartyItemsRequestAction | PushChangesThirdPartyItemsRequestAction | PublishAndPushChangesThirdPartyItemsRequestAction
>
