import { Dispatch } from 'redux'
import { Land } from 'modules/land/types'
import { ModalProps } from 'decentraland-ui'

export type Props = ModalProps & {
  metadata: {
    land: Land
    isEditing: boolean
  }
}

export type State = {
  selection: string[]
}

export type MapStateProps = {}
export type MapDispatchProps = {}
export type MapDispatch = Dispatch<any>
export type OwnProps = {}
