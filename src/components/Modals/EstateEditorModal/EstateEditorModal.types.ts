import { Dispatch } from 'redux'
import { Coord } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Land, LandTile } from 'modules/land/types'
import { createEstateRequest, editEstateRequest, CreateEstateRequestAction, EditEstateRequestAction } from 'modules/land/actions'

export type Props = ModalProps & {
  landTiles: Record<string, LandTile>
  metadata: EstateEditorModalMetadata
  onCreateEstate: typeof createEstateRequest
  onEditEstate: typeof editEstateRequest
}

export type State = {
  selection: Coord[]
  name: string
  description: string
  showCreationForm: boolean
}

export type EstateEditorModalMetadata = {
  land: Land
}

export type MapStateProps = Pick<Props, 'landTiles'>
export type MapDispatchProps = Pick<Props, 'onCreateEstate' | 'onEditEstate'>
export type MapDispatch = Dispatch<CreateEstateRequestAction | EditEstateRequestAction>
export type OwnProps = {}
