import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getEntityComponentsByType, getEntities } from 'modules/scene/selectors'
import { ComponentDefinition, ComponentType } from 'modules/scene/types'
import { getData as getAssets } from 'modules/asset/selectors'
import { setScriptValues } from 'modules/scene/actions'
import { getSelectedEntityIds } from 'modules/editor/selectors'

import { MapStateProps, MapDispatch, MapDispatchProps } from './EntityEditor.types'
import EntityEditor from './EntityEditor'
import { setSelectedEntities } from 'modules/editor/actions'

const mapState = (state: RootState): MapStateProps => {
  const selectedEntityIds = getSelectedEntityIds(state)
  const entityId = selectedEntityIds.length === 1 ? selectedEntityIds[0] : ''

  // The presence of both the entity and the script component are guranteed by the ItemDrawer container
  const components = getEntityComponentsByType(state)[entityId]
  const script = components[ComponentType.Script] as ComponentDefinition<ComponentType.Script>
  const entity = getEntities(state)[entityId]

  // TODO: There may not be an Asset if the scene is imported from another account
  const asset = getAssets(state)[script.data.assetId]
  return {
    asset,
    script,
    entity,
    entityId
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetScriptParameters: (entityId, parameters) => dispatch(setScriptValues(entityId, parameters)),
  onDeselect: () => dispatch(setSelectedEntities([]))
})

export default connect(mapState, mapDispatch)(EntityEditor)
