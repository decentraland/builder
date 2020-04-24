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
import { LEGACY_AUTH_REQUEST } from 'modules/auth/actions'
import { getData as getAssets } from 'modules/asset/selectors'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'

export const getState = (state: RootState) => state.editor
export const getGizmo = (state: RootState) => getState(state).gizmo
export const isSidebarOpen = (state: RootState) => getState(state).sidebar
export const isPreviewing = (state: RootState) => getState(state).preview
export const isSnapToGridEnabled = (state: RootState) => getState(state).snapToGrid
export const isMultiselectEnabled = (state: RootState) => getState(state).multiselectionEnabled
export const getSelectedEntityIds = (state: RootState) => getState(state).selectedEntityIds
export const isReady = (state: RootState) => getState(state).isReady
export const isLoading = (state: RootState) => getState(state).isLoading
export const isReadOnly = (state: RootState) => getState(state).isReadOnly
export const hasLoadedAssetPacks = (state: RootState) => getState(state).hasLoadedAssetPacks
export const isScreenshotReady = (state: RootState) => getState(state).isScreenshotReady
export const getEntitiesOutOfBoundaries = (state: RootState) => getState(state).entitiesOutOfBoundaries
export const areEntitiesOutOfBoundaries = (state: RootState) => getState(state).entitiesOutOfBoundaries.length > 0
export const getSceneMappings = createSelector<RootState, DataByKey<Asset>, Record<string, string>>(getAssets, assets => {
  const mappings = Object.values(assets).reduce<Record<string, string>>((mappings, asset) => {
    for (const path of Object.keys(asset.contents)) {
      mappings[`${asset.id}/${path}`] = asset.contents[path]
    }
    return mappings
  }, {})
  return mappings
})

export const getEnabledTools = createSelector<
  RootState,
  string[],
  Scene['entities'],
  Scene['components'],
  { move: boolean; rotate: boolean; duplicate: boolean; reset: boolean; delete: boolean }
>(getSelectedEntityIds, getEntities, getComponents, (selectedEntityIds, entities, components) => {
  let isNFT = false

  for (let entityId of selectedEntityIds) {
    const entity = entities[entityId]
    if (entity) {
      for (let componentId of entity.components) {
        if (components[componentId].type === ComponentType.NFTShape) {
          isNFT = true
          break
        }
      }
    }
  }

  return {
    move: selectedEntityIds.length > 0,
    rotate: selectedEntityIds.length > 0,
    scale: selectedEntityIds.length > 0,
    duplicate: selectedEntityIds.length > 0 && !isNFT,
    reset: selectedEntityIds.length > 0,
    delete: selectedEntityIds.length > 0
  }
})

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
    } else if (isLoadingType(loadingAuth, LEGACY_AUTH_REQUEST)) {
      return true
    }
    return false
  }
)
