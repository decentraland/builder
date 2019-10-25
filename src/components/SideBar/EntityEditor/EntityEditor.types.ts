import { Dispatch } from 'redux'
import { Asset } from 'modules/asset/types'
import { ComponentDefinition, ComponentType } from 'modules/scene/types'
import { setScriptParameters, SetScriptParametersAction } from 'modules/scene/actions'

export type Props = {
  entityId: string
  asset: Asset
  script: ComponentDefinition<ComponentType.Script>
  onSetScriptParameters: typeof setScriptParameters
}

export type State = {
  parameters: Record<string, any>
}

export type OwnProps = Pick<Props, 'entityId'>

export type MapStateProps = Pick<Props, 'asset' | 'script'>

export type MapDispatchProps = Pick<Props, 'onSetScriptParameters'>

export type MapDispatch = Dispatch<SetScriptParametersAction>
