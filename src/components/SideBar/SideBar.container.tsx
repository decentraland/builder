import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSideBarCategories } from 'modules/ui/sidebar/selectors'
import { isLoading } from 'modules/assetPack/selectors'
import { getSelectedEntityIds } from 'modules/editor/selectors'
import { getEntityComponentsByType } from 'modules/scene/selectors'
import { ComponentType } from 'modules/scene/types'
import { MapStateProps } from './SideBar.types'
import SideBar from './SideBar'

const mapState = (state: RootState): MapStateProps => {
  const selectedEntityIds = getSelectedEntityIds(state)
  let hasScript = false

  if (selectedEntityIds.length === 1) {
    const components = getEntityComponentsByType(state)[selectedEntityIds[0]]
    hasScript = !!components[ComponentType.Script]
  }

  return {
    categories: getSideBarCategories(state),
    isLoading: isLoading(state),
    hasScript: hasScript
  }
}

export default connect(mapState)(SideBar)
