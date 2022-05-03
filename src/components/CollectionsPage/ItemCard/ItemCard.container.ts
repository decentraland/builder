import { connect } from 'react-redux'
import { deleteItemRequest } from 'modules/item/actions'
import { openModal } from 'modules/modal/actions'
import ItemCard from './ItemCard'
import { MapDispatchProps, MapDispatch, OwnProps } from './ItemCard.types'

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onDeleteItem: () => dispatch(deleteItemRequest(ownProps.item)),
  onOpenModal: name => dispatch(openModal(name, { item: ownProps.item }))
})

export default connect(undefined, mapDispatch)(ItemCard)
