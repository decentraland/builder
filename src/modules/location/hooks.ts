import { useMemo } from 'react'
import { useLocation } from 'react-router'
import {
  getCollectionIdFromUrl,
  getENSNameFromPath,
  getItemIdFromPath,
  getLandIdFromPath,
  getProjectIdFromPath,
  getSelectedCollectionIdFromSearchParams,
  getSelectedItemIdFromSearchParams,
  getTemplateIdFromPath,
  isReviewingFromSearchParams
} from './url-parsers'

export const useGetSelectedItemIdFromCurrentUrl = () => {
  const location = useLocation()
  const selectedItemId = useMemo(() => getSelectedItemIdFromSearchParams(location.search), [location.search])
  return selectedItemId
}

export const useGetSelectedCollectionIdFromCurrentUrl = (): string | null => {
  const location = useLocation()
  const collectionId = useMemo(() => getSelectedCollectionIdFromSearchParams(location.search), [location.search])
  return collectionId
}

export const useGetIsReviewingFromCurrentUrl = (): boolean => {
  const location = useLocation()
  const isReviewing = useMemo(() => isReviewingFromSearchParams(location.search), [location.search])
  return isReviewing
}

export const useGetLandIdFromCurrentUrl = (): string | null => {
  const location = useLocation()
  const landId = useMemo(() => getLandIdFromPath(location.pathname), [location.pathname])
  return landId
}

export const useGetProjectIdFromCurrentUrl = (): string | null => {
  const location = useLocation()
  const projectId = useMemo(() => getProjectIdFromPath(location.pathname), [location.pathname])
  return projectId
}

export const useGetTemplateIdFromCurrentUrl = (): string | null => {
  const location = useLocation()
  const templateId = useMemo(() => getTemplateIdFromPath(location.pathname), [location.pathname])
  return templateId
}

export const useGetCollectionIdFromCurrentUrl = (): string | null => {
  const location = useLocation()
  return useMemo(() => getCollectionIdFromUrl(location.pathname), [location.pathname])
}

export const useGetENSNameFromCurrentUrl = (): string | null => {
  const location = useLocation()
  const ensName = useMemo(() => getENSNameFromPath(location.pathname), [location.pathname])
  return ensName
}

export const useGetItemIdFromCurrentUrl = (): string | null => {
  const location = useLocation()
  const itemId = useMemo(() => getItemIdFromPath(location.pathname), [location.pathname])
  return itemId
}
