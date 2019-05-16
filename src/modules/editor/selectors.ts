import { createSelector } from 'reselect'

import { RootState } from 'modules/common/types'
import { ComponentDefinition, ComponentType } from 'modules/scene/types'
import { getComponentByType } from 'modules/scene/selectors'

export const getState = (state: RootState) => state.editor
export const getGizmo = (state: RootState) => getState(state).gizmo
export const isSidebarOpen = (state: RootState) => getState(state).sidebar
export const isPreviewing = (state: RootState) => getState(state).preview
export const isSnapToGridEnabled = (state: RootState) => getState(state).snapToGrid
export const getSelectedEntityId = (state: RootState) => getState(state).selectedEntityId
export const isReady = (state: RootState) => getState(state).isReady
export const isLoading = (state: RootState) => getState(state).isLoading
export const getEntitiesOutOfBoundaries = (state: RootState) => getState(state).entitiesOutOfBoundaries
export const areEntitiesOutOfBoundaries = (state: RootState) => getState(state).entitiesOutOfBoundaries.length > 0
export const getSceneMappings = createSelector<RootState, ComponentDefinition<ComponentType.GLTFShape>[], Record<string, string>>(
  getComponentByType<ComponentType.GLTFShape>(ComponentType.GLTFShape),
  components =>
    components.reduce<Record<string, string>>(
      (mappings, component) => ({
        ...mappings,
        ...component.data.mappings
      }),
      {}
    )
)
