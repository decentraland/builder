import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getSelectedCollectionId, getSelectedItemId } from 'modules/location/selectors'
import { getBodyShape, getVisibleItems } from 'modules/editor/selectors'
import { setItems } from 'modules/editor/actions'
import { getItems, getWalletOrphanItems } from 'modules/item/selectors'
import { getAuthorizedCollections } from 'modules/collection/selectors'
import { setCollection } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LeftPanel.types'
import LeftPanel from './LeftPanel'

const mapState = (state: RootState): MapStateProps => ({
  items: getItems(state),
  orphanItems: getWalletOrphanItems(state),
  collections: getAuthorizedCollections(state),
  selectedItemId: getSelectedItemId(state),
  selectedCollectionId: getSelectedCollectionId(state),
  visibleItems: getVisibleItems(state),
  bodyShape: getBodyShape(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetItems: items => dispatch(setItems(items)),
  onSetCollection: (item, collectionId) => dispatch(setCollection(item, collectionId))
})

export default connect(mapState, mapDispatch)(LeftPanel)
