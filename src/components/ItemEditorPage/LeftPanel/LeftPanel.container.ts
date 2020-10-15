import { connect } from 'react-redux'
import { getSearch } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getCollections } from 'modules/collection/selectors'
import { getItems } from 'modules/item/selectors'
import { getBodyShape, getVisibleItems } from 'modules/editor/selectors'
import { setItems } from 'modules/editor/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LeftPanel.types'
import LeftPanel from './LeftPanel'

const mapState = (state: RootState): MapStateProps => ({
  items: getItems(state),
  collections: getCollections(state),
  selectedItemId: new URLSearchParams(getSearch(state)).get('item'),
  selectedCollectionId: new URLSearchParams(getSearch(state)).get('collection'),
  visibleItems: getVisibleItems(state),
  bodyShape: getBodyShape(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetItems: items => dispatch(setItems(items))
})

export default connect(mapState, mapDispatch)(LeftPanel)
