import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { Item, SyncStatus } from 'modules/item/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { PublishThirdPartyCollectionModalStep } from 'modules/ui/thirdparty/types'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import {
  publishAndPushChangesThirdPartyItemsRequest,
  PublishAndPushChangesThirdPartyItemsRequestAction,
  publishThirdPartyItemsRequest,
  PublishThirdPartyItemsRequestAction,
  pushChangesThirdPartyItemsRequest,
  PushChangesThirdPartyItemsRequestAction
} from 'modules/thirdParty/actions'

export type PublishThirdPartyCollectionModalMetadata = {
  collectionId: string
  itemIds: string[]
  action: PublishButtonAction
  step: PublishThirdPartyCollectionModalStep
}

export type Props = ModalProps & {
  metadata: PublishThirdPartyCollectionModalMetadata
  collection: Collection | null
  thirdParty: ThirdParty | null
  items: Item[]
  itemCurations: ItemCuration[]
  itemsStatus: Record<string, SyncStatus>
  isPublishLoading: boolean
  pushChangesProgress: number
  onPublish: typeof publishThirdPartyItemsRequest
  onPushChanges: typeof pushChangesThirdPartyItemsRequest
  onPublishAndPushChanges: typeof publishAndPushChangesThirdPartyItemsRequest
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<
  Props,
  'collection' | 'items' | 'thirdParty' | 'isPublishLoading' | 'itemsStatus' | 'itemCurations' | 'pushChangesProgress'
>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onPushChanges' | 'onPublishAndPushChanges'>
export type MapDispatch = Dispatch<
  PublishThirdPartyItemsRequestAction | PushChangesThirdPartyItemsRequestAction | PublishAndPushChangesThirdPartyItemsRequestAction
>
