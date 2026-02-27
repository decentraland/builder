import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { hasViewAndEditRights } from 'modules/collection/selectors'
import { useGetIsReviewingFromCurrentUrl } from 'modules/location/hooks'
import { RootState } from 'modules/common/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { deleteItemRequest } from 'modules/item/actions'
import { isLoggedIn } from 'modules/identity/selectors'
import { hasUserOrphanItems } from 'modules/item/selectors'
import Header from './Header'
import { useGetSelectedCollection } from 'modules/collection/hooks'

const HeaderContainer: React.FC = () => {
  const dispatch = useDispatch()
  const address = useSelector(getAddress)
  const isUserLoggedIn = useSelector(isLoggedIn)
  const isUserReviewing = useGetIsReviewingFromCurrentUrl()
  const hasOrphanItems = useSelector(hasUserOrphanItems)
  const collection = useGetSelectedCollection()
  const hasEditRights = useSelector((state: RootState) =>
    Boolean(collection && address && hasViewAndEditRights(state, address, collection))
  )

  const onOpenModal = useCallback((name: string, metadata: any) => dispatch(openModal(name, metadata)), [dispatch])
  const onDeleteCollection: ActionFunction<typeof deleteCollectionRequest> = useCallback(
    collection => dispatch(deleteCollectionRequest(collection)),
    [dispatch]
  )
  const onDeleteItem: ActionFunction<typeof deleteItemRequest> = useCallback(item => dispatch(deleteItemRequest(item)), [dispatch])

  return (
    <Header
      address={address}
      collection={collection ?? undefined}
      isLoggedIn={isUserLoggedIn}
      isReviewing={isUserReviewing}
      onOpenModal={onOpenModal}
      onDeleteCollection={onDeleteCollection}
      onDeleteItem={onDeleteItem}
      hasEditRights={hasEditRights}
      hasUserOrphanItems={hasOrphanItems}
    />
  )
}

export default HeaderContainer
