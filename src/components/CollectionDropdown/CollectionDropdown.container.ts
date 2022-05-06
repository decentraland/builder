import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getAuthorizedCollections } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionDropdown.types'
import ItemDropdown from './CollectionDropdown'

const mapState = (state: RootState): MapStateProps => ({
  collections: getAuthorizedCollections(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ItemDropdown)
