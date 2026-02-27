import { useSelector } from 'react-redux'
import { getCollection } from 'modules/collection/selectors'
import { RootState } from 'modules/common/types'
import { useGetSelectedCollectionIdFromCurrentUrl } from 'modules/location/hooks'

export const useGetSelectedCollection = () => {
  const selectedCollectionId = useGetSelectedCollectionIdFromCurrentUrl()
  return useSelector((state: RootState) => (selectedCollectionId ? getCollection(state, selectedCollectionId) : null))
}
