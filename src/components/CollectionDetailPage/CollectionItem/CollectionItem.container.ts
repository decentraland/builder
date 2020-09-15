import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { setCollection } from 'modules/item/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onRemoveFromCollection: item => dispatch(setCollection(item, null))
})

export default connect(mapState, mapDispatch)(CollectionItem)
