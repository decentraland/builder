import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { CallHistoryMethodAction } from 'connected-react-router'

import { CreateProjectFromTemplateAction, DuplicateProjectAction, duplicateProject } from 'modules/project/actions'
import { Template } from 'modules/template/types'
import { Project } from 'modules/project/types'

export type Props = ModalProps & {
  metadata: CustomLayoutModalMetadata
  error: string | null
  isLoading: boolean
  onCreateProject: (name: string, description: string, template: Template) => void
  onDuplicate: typeof duplicateProject
}

export type CustomLayoutModalMetadata = {
  template?: Project
}

export type State = {
  rows: number
  cols: number
  setSize: boolean
  hasError: boolean
  name: string
  description: string
}

export type MapStateProps = Pick<Props, 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onCreateProject' | 'onDuplicate'>
export type MapDispatch = Dispatch<CreateProjectFromTemplateAction | DuplicateProjectAction | CallHistoryMethodAction>
