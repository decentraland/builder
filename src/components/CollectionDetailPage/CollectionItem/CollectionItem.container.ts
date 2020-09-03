import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'

import { MapStateProps, MapDispatch, MapDispatchProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(CollectionItem)
