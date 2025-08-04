import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import {
  useGetIsReviewingFromCurrentUrl,
  useGetSelectedCollectionIdFromCurrentUrl,
  useGetSelectedItemIdFromCurrentUrl
} from 'modules/location/hooks'
import { getCollection } from 'modules/collection/selectors'
import { isThirdPartyCollection } from 'modules/collection/utils'
import { getPaginatedCollectionItems } from 'modules/item/selectors'
import { getFirstWearableOrItem } from 'modules/item/utils'
import { getVisibleItemsFromUrl } from './selectors'

export const useGetVisibleItems = () => {
  const { search } = useLocation()
  const visibleItems = useSelector((state: RootState) => getVisibleItemsFromUrl(state, search))
  return visibleItems
}

export const useGetSelectedItemId = () => {
  const selectedItemId = useGetSelectedItemIdFromCurrentUrl()
  const collectionId = useGetSelectedCollectionIdFromCurrentUrl()
  const isReviewing = useGetIsReviewingFromCurrentUrl()

  const collection = useSelector((state: RootState) => (collectionId ? getCollection(state, collectionId) : null))
  const isReviewingTPCollection = useMemo(
    () => (collection ? isThirdPartyCollection(collection) && isReviewing : false),
    [collection, isReviewing]
  )
  const allItems = useSelector((state: RootState) => (collectionId ? getPaginatedCollectionItems(state, collectionId) : []))
  const itemId = useMemo(() => {
    const items = isReviewingTPCollection ? allItems.filter(item => item.isPublished) : allItems
    return getFirstWearableOrItem(items)?.id ?? null
  }, [allItems, isReviewingTPCollection])
  return selectedItemId || itemId
}
