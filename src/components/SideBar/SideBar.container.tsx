import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSideBarCategories } from 'modules/ui/sidebar/selectors'
import { isLoading } from 'modules/assetPack/selectors'
import { getSelectedEntityId } from 'modules/editor/selectors'
import { getEntityComponentsByType } from 'modules/scene/selectors'
import { ComponentType } from 'modules/scene/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SideBar.types'
import SideBar from './SideBar'

const mapState = (state: RootState): MapStateProps => {
  const selectedEntityId = getSelectedEntityId(state)
  const components = selectedEntityId ? getEntityComponentsByType(state)[selectedEntityId] : null

  return {
    categories: getSideBarCategories(state),
    isLoading: isLoading(state),
    hasScript: components ? !!components[ComponentType.Script] : false
  }
}

const mapDispatch = (_: MapDispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(SideBar)
