import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './AvatarPage.types'
import AvatarPage from './AvatarPage'
import { openModal } from 'modules/modal/actions'
import { getItems } from 'modules/item/selectors'
import { getCollections } from 'modules/collection/selectors'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { getLoading as getLoadingItems } from 'modules/item/selectors'
import { getLoading as getLoadingCollections } from 'modules/collection/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'

const mapState = (state: RootState): MapStateProps => ({
  items: getItems(state),
  collections: getCollections(state),
  isLoggedIn: isLoggedIn(state),
  isLoading:
    isLoggingIn(state) ||
    isLoadingType(getLoadingItems(state), FETCH_ITEMS_REQUEST) ||
    isLoadingType(getLoadingCollections(state), FETCH_COLLECTIONS_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(AvatarPage)
