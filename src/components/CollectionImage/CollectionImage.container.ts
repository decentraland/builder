import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getAuthorizedItems, getLoading as getLoadingItem } from 'modules/item/selectors'
import { getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { OwnProps, MapStateProps } from './CollectionImage.types'
import CollectionImage from './CollectionImage'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const allItems = getAuthorizedItems(state)
  const collection = ownProps.collection
  const items = allItems.filter(item => item.collectionId === collection.id)
  return {
    items,
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) || isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST)
  }
}

const mapDispatch = () => ({})

export default connect(mapState, mapDispatch)(CollectionImage)
