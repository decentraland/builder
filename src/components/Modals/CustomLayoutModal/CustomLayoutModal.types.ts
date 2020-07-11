import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { CallHistoryMethodAction } from 'connected-react-router'

import { CreateProjectFromTemplateAction } from 'modules/project/actions'
import { Template } from 'modules/template/types'

export type Props = ModalProps & {
  onCreateProject: (name: string, description: string, template: Template) => void
}

export type State = {
  rows: number
  cols: number
  setSize: boolean
  hasError: boolean
  name: string
  description: string
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onCreateProject'>
export type MapDispatch = Dispatch<CreateProjectFromTemplateAction | CallHistoryMethodAction>
