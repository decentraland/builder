import { createSelector } from 'reselect'

import { RootState } from 'modules/common/types'
import { ComponentType, Scene } from 'modules/scene/types'
import { getEntities, getComponents } from 'modules/scene/selectors'
import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { getCurrentProject, getLoading as getLoadingProject } from 'modules/project/selectors'
import { getLoading as getLoadingAuth } from 'modules/auth/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { LOAD_MANIFEST_REQUEST } from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { AUTH_REQUEST } from 'modules/auth/actions'
import { getData as getAssets } from 'modules/asset/selectors'
import { Asset } from 'modules/asset/types'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'

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
export const getSceneMappings = createSelector<RootState, DataByKey<Asset>, Record<string, string>>(
  getAssets,
  assets => {
    const mappings = Object.values(assets).reduce<Record<string, string>>((mappings, asset) => {
      for (const path of Object.keys(asset.contents)) {
        mappings[`${asset.id}/${path}`] = asset.contents[path]
      }
      return mappings
    }, {})
    console.log(mappings)
    return mappings
  }
)

export const getEnabledTools = createSelector<
  RootState,
  string | null,
  Scene['entities'],
  Scene['components'],
  { move: boolean; rotate: boolean; duplicate: boolean; reset: boolean; delete: boolean }
>(
  getSelectedEntityId,
  getEntities,
  getComponents,
  (selectedEntityId, entities, components) => {
    let isNFT = false
    const entity = selectedEntityId ? entities[selectedEntityId] : null

    if (entity) {
      for (let componentId of entity.components) {
        if (components[componentId].type === ComponentType.NFTShape) {
          isNFT = true
        }
      }
    }

    return {
      move: !!selectedEntityId,
      rotate: !!selectedEntityId,
      scale: !!selectedEntityId,
      duplicate: !!selectedEntityId && !isNFT,
      reset: !!selectedEntityId,
      delete: !!selectedEntityId
    }
  }
)

export const isFetching = createSelector<RootState, Project | null, boolean, LoadingState, LoadingState, boolean>(
  getCurrentProject,
  isReady,
  getLoadingProject,
  getLoadingAuth,
  (project, _ready, loadingProject, loadingAuth) => {
    if (project) {
      return false
    } else if (isLoadingType(loadingProject, LOAD_MANIFEST_REQUEST)) {
      return true
    } else if (isLoadingType(loadingAuth, AUTH_REQUEST)) {
      return true
    }
    return false
  }
)
