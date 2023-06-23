import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Project } from 'modules/project/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { duplicateProject, DuplicateProjectAction } from 'modules/project/actions'

export type Props = {
  template: Project | null
  isLoading: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onDuplicate: typeof duplicateProject
}

export type MapStateProps = Pick<Props, 'template' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onDuplicate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | DuplicateProjectAction | OpenModalAction>
