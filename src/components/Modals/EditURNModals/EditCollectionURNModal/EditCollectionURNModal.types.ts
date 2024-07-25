import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { DecodedURN, URN, URNType } from 'lib/urn'
import { saveCollectionRequest, SaveCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export type Props = ModalProps & {
  elementName: string
  urn: URN
  isLoading: boolean
  metadata: EditURNModalMetadata
  error: string | null
  onSave: (urn: string) => ReturnType<typeof saveCollectionRequest>
  onBuildURN: (decodedURN: DecodedURN<URNType.COLLECTIONS_THIRDPARTY>, collectionId: string) => string
}

export type EditURNModalMetadata = {
  collection: Collection
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'elementName' | 'urn' | 'isLoading' | 'error'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onBuildURN'>
export type MapDispatch = Dispatch<SaveCollectionRequestAction>
