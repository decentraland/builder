import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getStatusByCollectionId } from 'modules/collection/selectors'
import CollectionStatus from './CollectionStatus'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionStatus.types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByCollectionId = getStatusByCollectionId(state)
  return {
    status: statusByCollectionId[ownProps.collection.id]
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(CollectionStatus)
