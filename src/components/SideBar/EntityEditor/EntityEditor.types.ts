import { Dispatch } from 'redux'
import { Asset } from 'modules/asset/types'
import { ComponentDefinition, ComponentType, EntityDefinition } from 'modules/scene/types'
import { setScriptValues, SetScriptValuesAction } from 'modules/scene/actions'

export type Props = {
  entityId: string
  asset: Asset
  entity: EntityDefinition
  script: ComponentDefinition<ComponentType.Script>
  onSetScriptParameters: typeof setScriptValues
  onClose: () => void
}

export type OwnProps = Pick<Props, 'entityId'>

export type MapStateProps = Pick<Props, 'asset' | 'script' | 'entity'>

export type MapDispatchProps = Pick<Props, 'onSetScriptParameters'>

export type MapDispatch = Dispatch<SetScriptValuesAction>
