import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getItems } from 'modules/item/selectors'
import { OwnProps, MapStateProps } from './CollectionCard.types'
import CollectionCard from './CollectionCard'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const allItems = getItems(state)
  const collection = ownProps.collection
  const items = allItems.filter(item => item.collectionId === collection.id)
  return { items }
}

const mapDispatch = () => ({})

export default connect(mapState, mapDispatch)(CollectionCard)
