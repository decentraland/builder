import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getSelectedCollectionId, getSelectedItemId } from 'modules/location/selectors'
import { getBodyShape, getVisibleItems } from 'modules/editor/selectors'
import { setItems } from 'modules/editor/actions'
import { getItems, getWalletOrphanItems } from 'modules/item/selectors'
import { getWalletCollections } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LeftPanel.types'
import LeftPanel from './LeftPanel'

const mapState = (state: RootState): MapStateProps => ({
  items: getItems(state),
  orphanItems: getWalletOrphanItems(state),
  collections: getWalletCollections(state),
  selectedItemId: getSelectedItemId(state),
  selectedCollectionId: getSelectedCollectionId(state),
  visibleItems: getVisibleItems(state),
  bodyShape: getBodyShape(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetItems: items => dispatch(setItems(items))
})

export default connect(mapState, mapDispatch)(LeftPanel)
