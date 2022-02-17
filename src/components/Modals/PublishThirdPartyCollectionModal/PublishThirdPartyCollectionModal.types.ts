import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { Item } from 'modules/item/types'
import { publishThirdPartyItemsRequest, PublishThirdPartyItemsRequestAction } from 'modules/item/actions'

export type PublishThirdPartyCollectionModalMetadata = {
  collectionId: string
  itemIds: string[]
  willPushChanges: boolean
}

export type Props = ModalProps & {
  metadata: PublishThirdPartyCollectionModalMetadata
  collection: Collection | null
  thirdParty: ThirdParty | null
  items: Item[]
  isPublishLoading: boolean
  onPublish: typeof publishThirdPartyItemsRequest
  onPushChanges: typeof publishThirdPartyItemsRequest // TODO: pushChangesType of action
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'collection' | 'items' | 'thirdParty' | 'isPublishLoading'>
export type MapDispatchProps = Pick<Props, 'onPublish'>
export type MapDispatch = Dispatch<PublishThirdPartyItemsRequestAction>
