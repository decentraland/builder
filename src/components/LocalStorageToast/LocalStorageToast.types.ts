import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  project: Project | null
  isVisible: boolean
  onOpenModal: typeof openModal
}

export type State = {
  isVisible: boolean
}

export type MapStateProps = Pick<Props, 'project'>
export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
