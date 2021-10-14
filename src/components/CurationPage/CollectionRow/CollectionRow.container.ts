import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCollectionItems } from 'modules/item/selectors'
import { OwnProps, MapStateProps, MapDispatchProps } from './CollectionRow.types'
import CollectionRow from './CollectionRow'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  items: getCollectionItems(state, ownProps.collection.id)
})

const mapDispatch = (): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(CollectionRow)
