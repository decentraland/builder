import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

import { createProjectFromTemplate, CreateProjectFromTemplateAction } from 'modules/project/actions'

export type Props = ModalProps & {
  onCreateProject: typeof createProjectFromTemplate
}

export type State = {
  rows: number
  cols: number
  hasError: boolean
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onCreateProject'>
export type MapDispatch = Dispatch<CreateProjectFromTemplateAction | NavigateToAction>
