import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getStatusByItemId } from 'modules/item/selectors'
import { SyncStatus } from 'modules/item/types'
import ResetItemButton from './ResetItemButton'
import { MapStateProps, OwnProps } from './ResetItemButton.types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { itemId } = ownProps

  return {
    isEnabled: getStatusByItemId(state)[itemId] === SyncStatus.UNSYNCED
  }
}

export default connect(mapState)(ResetItemButton)
