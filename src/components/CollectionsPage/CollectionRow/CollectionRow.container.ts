import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCollectionItemCount } from 'modules/collection/selectors'
import { OwnProps, MapStateProps } from './CollectionRow.types'
import CollectionRow from './CollectionRow'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  itemCount: getCollectionItemCount(state, ownProps.collection.id)
})

export default connect(mapState)(CollectionRow)
