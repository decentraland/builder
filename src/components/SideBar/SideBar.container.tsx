import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSideBarCategories } from 'modules/ui/sidebar/selectors'
import { isLoading } from 'modules/assetPack/selectors'
import { getSelectedEntitiesId } from 'modules/editor/selectors'
import { getEntityComponentsByType } from 'modules/scene/selectors'
import { ComponentType } from 'modules/scene/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SideBar.types'
import SideBar from './SideBar'

const mapState = (state: RootState): MapStateProps => {
  const selectedEntitiesId = getSelectedEntitiesId(state)
  let hasScript: boolean = false

  if (selectedEntitiesId.length === 1) {
    const components = getEntityComponentsByType(state)[selectedEntitiesId[0]]
    hasScript = !!components[ComponentType.Script]
  }

  return {
    categories: getSideBarCategories(state),
    isLoading: isLoading(state),
    hasScript: hasScript
  }
}

const mapDispatch = (_: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(SideBar)
