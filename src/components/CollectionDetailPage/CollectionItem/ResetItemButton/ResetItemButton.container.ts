import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getStatusByItemId } from 'modules/item/selectors'
import { SyncStatus } from 'modules/item/types'
import { openModal } from 'modules/modal/actions'
import ResetItemButton from './ResetItemButton'
import { MapStateProps, OwnProps, MapDispatch, MapDispatchProps } from './ResetItemButton.types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { itemId } = ownProps

  return {
    isEnabled: getStatusByItemId(state)[itemId] === SyncStatus.UNSYNCED
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => {
  const { itemId } = ownProps

  return {
    onClick: () => dispatch(openModal('ResetItemModal', { itemId }))
  }
}

export default connect(mapState, mapDispatch)(ResetItemButton)
