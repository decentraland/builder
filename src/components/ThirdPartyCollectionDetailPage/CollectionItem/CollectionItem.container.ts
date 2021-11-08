import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { setCollection } from 'modules/item/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'

const mapState = (state: RootState): MapStateProps => ({
  ethAddress: getAddress(state),
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onRemoveFromCollection: item => dispatch(setCollection(item, null))
})

export default connect(mapState, mapDispatch)(CollectionItem)
