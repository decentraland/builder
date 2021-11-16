import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'

const mapState = (): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(CollectionItem)
