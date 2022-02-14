import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getItem, getStatusByItemId } from 'modules/item/selectors'
import { SyncStatus } from 'modules/item/types'
import { openModal } from 'modules/modal/actions'
import ResetItemButton from './ResetItemButton'
import { MapStateProps, OwnProps, MapDispatch, MapDispatchProps } from './ResetItemButton.types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { itemId } = ownProps
  const item = getItem(state, itemId)

  return {
    isEnabled: getStatusByItemId(state, item?.collectionId)[itemId] === SyncStatus.UNSYNCED
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => {
  const { itemId } = ownProps

  return {
    onClick: () => dispatch(openModal('ResetItemModal', { itemId }))
  }
}

export default connect(mapState, mapDispatch)(ResetItemButton)
