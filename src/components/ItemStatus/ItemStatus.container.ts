import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ItemStatus.types'
import { getStatusByItemId } from 'modules/item/selectors'
import ItemStatus from './ItemStatus'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByItemId = getStatusByItemId(state, ownProps.item.collectionId)
  return {
    status: statusByItemId[ownProps.item.id]
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ItemStatus)
