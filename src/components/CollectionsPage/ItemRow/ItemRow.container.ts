import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { MapDispatchProps, MapDispatch } from './ItemRow.types'
import CollectionRow from './ItemRow'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(null, mapDispatch)(CollectionRow)
