import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { DecodedURN, URN, URNType } from 'lib/urn'
import { saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = ModalProps & {
  elementName: string
  urn: URN
  isLoading: boolean
  metadata: EditURNModalMetadata
  onSave: (urn: string) => ReturnType<typeof saveItemRequest>
  onBuildURN: (decodedURN: DecodedURN<URNType.COLLECTIONS_THIRDPARTY>, tokenId: string) => string
}

export type EditURNModalMetadata = {
  item: Item
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'elementName' | 'urn' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onBuildURN'>
export type MapDispatch = Dispatch<SaveItemRequestAction>
