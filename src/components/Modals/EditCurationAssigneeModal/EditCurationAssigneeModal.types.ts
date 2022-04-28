import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Profile } from 'decentraland-dapps/dist/modules/profile/types'
import { setCollectionCurationAssigneeRequest } from 'modules/curations/collectionCuration/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { Collection } from 'modules/collection/types'

export enum AssignModalOperationType {
  SELF_ASSIGN = 'self_assign',
  REASSIGN = 'reassign'
}

export type Props = Omit<ModalProps, 'metadata'> & {
  profiles: Record<string, Profile>
  collection: Collection | null
  curation: CollectionCuration | null
  isLoading: boolean
  address?: string
  committeeMembers: string[]
  metadata: {
    collectionId: string
    type: AssignModalOperationType
  }
  onSetAssignee: typeof setCollectionCurationAssigneeRequest
}

export type State = {
  assignee: string | null
}

export type MapState = Pick<Props, 'profiles' | 'address' | 'isLoading' | 'committeeMembers' | 'curation' | 'collection'>
export type MapDispatch = Dispatch
export type MapDispatchProps = Pick<Props, 'onSetAssignee'>
export type OwnProps = Pick<Props, 'metadata'>
