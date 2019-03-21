import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

import { Project } from 'modules/project/types'
import { Contest } from 'modules/contest/types'
import { submitProjectRequest, SubmitProjectRequestAction, acceptTerms, AcceptTermsAction } from 'modules/contest/actions'
import { editProjectRequest, EditProjectRequestAction } from 'modules/project/actions'

export type Props = ModalProps & {
  currentProject: Project | null
  contest: Contest
  isLoading: boolean
  error: string | null
  userEmail: string
  hasAcceptedTerms: boolean
  onSaveProject: typeof editProjectRequest
  onSubmitProject: typeof submitProjectRequest
  onAcceptTerms: typeof acceptTerms
}

export type State = {
  project: Project
  contest: Contest
}

export type MapStateProps = Pick<Props, 'currentProject' | 'contest' | 'isLoading' | 'error' | 'userEmail' | 'hasAcceptedTerms'>
export type MapDispatchProps = Pick<Props, 'onSaveProject' | 'onSubmitProject' | 'onAcceptTerms'>
export type MapDispatch = Dispatch<EditProjectRequestAction | SubmitProjectRequestAction | AcceptTermsAction>
