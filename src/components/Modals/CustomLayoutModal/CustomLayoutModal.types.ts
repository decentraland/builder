import { Dispatch } from 'redux'
import { NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

import { Props as ModalProps, MapDispatchProps as ModalMapDispatchProps, MapDispatch as ModalMapDispatch } from '../Modals.types'
import { createProjectFromTemplate, CreateProjectFromTemplateAction } from 'modules/project/actions'

export type Props = ModalProps & {
  onCreateProject: typeof createProjectFromTemplate
}

export type State = {
  rows: number
  cols: number
  error: boolean
}

export type MapStateProps = {}
export type MapDispatchProps = ModalMapDispatchProps & Pick<Props, 'onCreateProject'>
export type MapDispatch = ModalMapDispatch & Dispatch<CreateProjectFromTemplateAction | NavigateToAction>
