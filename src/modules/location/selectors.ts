import { locations } from 'routing/locations'
import { createMatchSelector, getSearch } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getCollectionItems } from 'modules/item/selectors'
import { ItemType } from 'modules/item/types'

const landIdMatchSelector = createMatchSelector<
  RootState,
  {
    landId: string
  }
>(locations.landDetail())

export const getLandId = (state: RootState) => {
  const result = landIdMatchSelector(state)
  return result ? result.params.landId : null
}

const projectIdMatchSelector = createMatchSelector<
  RootState,
  {
    projectId: string
  }
>(locations.sceneDetail())

export const getProjectId = (state: RootState) => {
  const result = projectIdMatchSelector(state)
  return result ? result.params.projectId : null
}

const templateIdMatchSelector = createMatchSelector<
  RootState,
  {
    templateId: string
  }
>(locations.templateDetail())

export const getTemplateId = (state: RootState) => {
  const result = templateIdMatchSelector(state)
  return result ? result.params.templateId : null
}

const itemIdMatchSelector = createMatchSelector<
  RootState,
  {
    itemId: string
  }
>(locations.itemDetail())

export const getItemId = (state: RootState) => {
  const result = itemIdMatchSelector(state)
  return result ? result.params.itemId : null
}

const collectionIdMatchSelector = createMatchSelector<
  RootState,
  {
    collectionId: string
  }
>([locations.collectionDetail(), locations.thirdPartyCollectionDetail()])

export const getCollectionId = (state: RootState) => {
  const result = collectionIdMatchSelector(state)
  return result ? result.params.collectionId : null
}

export const getSelectedItemId = (state: RootState) => {
  const selectedItemId = new URLSearchParams(getSearch(state)).get('item')
  if (selectedItemId) return selectedItemId

  const collectionId = getSelectedCollectionId(state)
  if (!collectionId) return null

  const items = getCollectionItems(state, collectionId)
  return (items.find(item => item.type === ItemType.WEARABLE) || items[0])?.id ?? null
}
export const getSelectedCollectionId = (state: RootState) => new URLSearchParams(getSearch(state)).get('collection')
export const isReviewing = (state: RootState) => !!new URLSearchParams(getSearch(state)).get('reviewing')
export const getState = (state: RootState) => state.location
export const hasHistory = (state: RootState) => getState(state).hasHistory
