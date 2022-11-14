import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { MapStateProps, OwnProps } from './ItemStatus.types'
import { getStatusByItemId } from 'modules/item/selectors'
import ItemStatus from './ItemStatus'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByItemId = getStatusByItemId(state)
  return {
    status: statusByItemId[ownProps.item.id]
  }
}

export default connect(mapState)(ItemStatus)
