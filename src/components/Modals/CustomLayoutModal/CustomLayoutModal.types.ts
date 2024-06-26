import { Dispatch } from 'redux'
import { History } from 'history'
import { RouteComponentProps } from 'react-router-dom'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

import { CreateProjectFromTemplateAction } from 'modules/project/actions'
import { Template } from 'modules/template/types'
import { SDKVersion } from 'modules/scene/types'

export type Props = ModalProps &
  RouteComponentProps & {
    error: string | null
    isLoading: boolean
    onCreateProject: (name: string, description: string, template: Template, sdk: SDKVersion, history: History) => void
    isCreateSceneOnlySDK7Enabled: boolean
  }

export enum SceneCreationStep {
  INFO = 'info',
  SIZE = 'size',
  // TODO: remove this after removing the SDK7_TEMPLATES feature flag
  SDK = 'sdk'
}

export type State = {
  rows: number
  cols: number
  step: SceneCreationStep
  hasError: boolean
  name: string
  description: string
}

export type MapStateProps = Pick<Props, 'error' | 'isLoading' | 'isCreateSceneOnlySDK7Enabled'>
export type MapDispatchProps = Pick<Props, 'onCreateProject'>
export type MapDispatch = Dispatch<CreateProjectFromTemplateAction>
