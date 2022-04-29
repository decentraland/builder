import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { openModal } from 'modules/modal/actions'
import { RootState } from 'modules/common/types'
import { getCollectionItemCount } from 'modules/collection/selectors'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './CollectionRow.types'
import CollectionRow from './CollectionRow'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  address: getAddress(state),
  itemCount: getCollectionItemCount(state, ownProps.collection.id)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(CollectionRow)
