import { Dispatch } from 'redux'
import { Asset } from 'modules/asset/types'
import { ComponentDefinition, ComponentType, EntityDefinition } from 'modules/scene/types'
import { setScriptValues, SetScriptValuesAction } from 'modules/scene/actions'
import { SetSelectedEntitiesAction } from 'modules/editor/actions'

export type Props = {
  entityId: string
  asset: Asset
  entity: EntityDefinition
  script: ComponentDefinition<ComponentType.Script>
  onSetScriptParameters: typeof setScriptValues
  onDeselect: () => void
}

export type MapStateProps = Pick<Props, 'asset' | 'script' | 'entity' | 'entityId'>

export type MapDispatchProps = Pick<Props, 'onSetScriptParameters' | 'onDeselect'>

export type MapDispatch = Dispatch<SetScriptValuesAction | SetSelectedEntitiesAction>
