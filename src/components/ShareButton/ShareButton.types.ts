import { Dispatch } from 'redux'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Project } from 'modules/project/types'

export type Props = {
  project: Project
  isLoading: boolean
  onOpenModal: typeof openModal
  onClick: () => void
}

export type DefaultProps = Pick<Props, 'onClick'>

export type MapStateProps = Pick<Props, 'project' | 'isLoading'>

export type MapDispatchProps = Pick<Props, 'onOpenModal'>

export type MapDispatch = Dispatch<OpenModalAction>
