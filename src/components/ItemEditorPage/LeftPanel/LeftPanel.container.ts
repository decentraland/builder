import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCollections } from 'modules/collection/selectors'
import { getItems, getOrphanItems } from 'modules/item/selectors'
import { getBodyShape, getVisibleItems } from 'modules/editor/selectors'
import { setItems } from 'modules/editor/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LeftPanel.types'
import LeftPanel from './LeftPanel'
import { getSelectedCollectionId, getSelectedItemId } from 'modules/location/selectors'

const mapState = (state: RootState): MapStateProps => ({
  items: getItems(state),
  orphanItems: getOrphanItems(state),
  collections: getCollections(state),
  selectedItemId: getSelectedItemId(state),
  selectedCollectionId: getSelectedCollectionId(state),
  visibleItems: getVisibleItems(state),
  bodyShape: getBodyShape(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetItems: items => dispatch(setItems(items))
})

export default connect(mapState, mapDispatch)(LeftPanel)
