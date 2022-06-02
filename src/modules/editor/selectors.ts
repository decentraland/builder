import { createSelector } from 'reselect'
import { Wearable } from 'decentraland-ecs'
import { WearableBodyShape } from '@dcl/schemas'

import { RootState } from 'modules/common/types'
import { ComponentType, Scene } from 'modules/scene/types'
import { getEntities, getComponents } from 'modules/scene/selectors'
import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { getCurrentProject, getLoading as getLoadingProject } from 'modules/project/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { LOAD_MANIFEST_REQUEST } from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { getData as getAssets } from 'modules/asset/selectors'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'
import { ItemState } from 'modules/item/reducer'
import { getData } from 'modules/item/selectors'
import { Item } from 'modules/item/types'
import { getSelectedCollectionId, isReviewing } from 'modules/location/selectors'
import { SelectedBaseWearablesByBodyShape } from './types'
import { FETCH_BASE_WEARABLES_REQUEST } from './actions'

const getLoading = (state: RootState) => getState(state).loading
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
export const getBodyShape = (state: RootState) => getState(state).bodyShape
export const getEmote = (state: RootState) => getState(state).emote
export const getSkinColor = (state: RootState) => getState(state).skinColor
export const getEyeColor = (state: RootState) => getState(state).eyeColor
export const getHairColor = (state: RootState) => getState(state).hairColor
export const getBaseWearables = (state: RootState): Wearable[] => getState(state).baseWearables
export const getSelectedBaseWearablesByBodyShape = (state: RootState): SelectedBaseWearablesByBodyShape | null =>
  getState(state).selectedBaseWearablesByBodyShape
export const getSelectedBaseWearables = createSelector<
  RootState,
  WearableBodyShape,
  SelectedBaseWearablesByBodyShape | null,
  Record<string, Wearable | null> | null
>(getBodyShape, getSelectedBaseWearablesByBodyShape, (bodyShape, selectedWearablesByBodyShape) =>
  selectedWearablesByBodyShape ? selectedWearablesByBodyShape[bodyShape] : null
)
export const getFetchingBaseWearablesError = (state: RootState) => getState(state).fetchingBaseWearablesError
export const isLoadingBaseWearables = (state: RootState): boolean =>
  isLoadingType(getLoading(state), FETCH_BASE_WEARABLES_REQUEST) ||
  (getBaseWearables(state).length === 0 && getFetchingBaseWearablesError(state) === null)

export const getVisibleItemIds = (state: RootState) => getState(state).visibleItemIds
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

export const isFetching = createSelector<RootState, Project | null, boolean, LoadingState, boolean>(
  getCurrentProject,
  isReady,
  getLoadingProject,
  (project, _ready, loadingProject) => {
    if (project) {
      return false
    } else if (isLoadingType(loadingProject, LOAD_MANIFEST_REQUEST)) {
      return true
    }
    return false
  }
)

export const getVisibleItems = createSelector<RootState, string | null, boolean, string[], ItemState['data'], Item[]>(
  getSelectedCollectionId,
  isReviewing,
  getVisibleItemIds,
  getData,
  (selectedCollectionId, reviewing, itemIds, itemData) =>
    itemIds
      .map(id => itemData[id])
      .filter(item => {
        if (!item) {
          return false
        }
        if (reviewing) {
          if (selectedCollectionId) {
            return selectedCollectionId === item.collectionId
          } else {
            return !item.collectionId
          }
        } else {
          return true
        }
      })
)
