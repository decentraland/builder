import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getEntityComponentsByType } from 'modules/scene/selectors'
import { ComponentDefinition, ComponentType } from 'modules/scene/types'
import { getData as getAssets } from 'modules/asset/selectors'
import { setScriptValues } from 'modules/scene/actions'

import { OwnProps, MapStateProps, MapDispatch, MapDispatchProps } from './EntityEditor.types'
import EntityEditor from './EntityEditor'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  // The presence of both the entity and the script component are guranteed by the ItemDrawer container
  const components = getEntityComponentsByType(state)[ownProps.entityId]
  const script = components![ComponentType.Script] as ComponentDefinition<ComponentType.Script>
  // TODO: There may not be an Asset if the scene is imported from another account
  const asset = getAssets(state)[script.data.assetId]
  return {
    asset,
    script
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetScriptParameters: (entityId, parameters) => dispatch(setScriptValues(entityId, parameters))
})

export default connect(
  mapState,
  mapDispatch
)(EntityEditor)
