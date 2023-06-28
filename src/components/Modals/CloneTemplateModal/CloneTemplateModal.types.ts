import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { CallHistoryMethodAction } from 'connected-react-router'

import { DuplicateProjectRequestAction, duplicateProjectRequest } from 'modules/project/actions'
import { Project } from 'modules/project/types'

export type Props = ModalProps & {
  metadata: CloneTemplateModalMetadata
  alias: string | null
  error: string | null
  isLoading: boolean
  onDuplicate: typeof duplicateProjectRequest
}

export type CloneTemplateModalMetadata = {
  template: Project
}

export type MapStateProps = Pick<Props, 'alias' | 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onDuplicate'>
export type MapDispatch = Dispatch<DuplicateProjectRequestAction | CallHistoryMethodAction>
