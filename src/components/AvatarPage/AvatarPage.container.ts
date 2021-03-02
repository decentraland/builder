import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { getWalletOrphanItems, getLoading as getLoadingItems } from 'modules/item/selectors'
import { getAuthorizedCollections, getLoading as getLoadingCollections } from 'modules/collection/selectors'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './AvatarPage.types'
import AvatarPage from './AvatarPage'

const mapState = (state: RootState): MapStateProps => {
  const items = getWalletOrphanItems(state)

  return {
    items,
    collections: getAuthorizedCollections(state),
    isLoading:
      isLoadingType(getLoadingItems(state), FETCH_ITEMS_REQUEST) || isLoadingType(getLoadingCollections(state), FETCH_COLLECTIONS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(AvatarPage)
