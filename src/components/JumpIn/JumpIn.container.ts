import { connect } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import JumpIn from './JumpIn'
import { MapDispatch, MapDispatchProps, OwnProps } from './JumpIn.types'

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => {
  return {
    onJumpIn: () =>
      dispatch(
        openModal('SeeInWorldModal', { itemIds: ownProps.items?.map(item => item.id), collectionId: ownProps?.collection?.id })
      ) as unknown
  }
}

export default connect(undefined, mapDispatch)(JumpIn)
