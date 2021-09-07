import { connect } from 'react-redux'
import { setENSContentRequest, SET_ENS_CONTENT_REQUEST } from 'modules/ens/actions'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getLoading } from 'modules/ens/selectors'
import { MapDispatchProps, MapDispatch, MapStateProps } from './UnsetENSContentModal.types'
import UnsetENSContentModal from './UnsetENSContentModal'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isLoadingType(getLoading(state), SET_ENS_CONTENT_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onUnsetENSContent: ens => dispatch(setENSContentRequest(ens))
})

export default connect(mapState, mapDispatch)(UnsetENSContentModal)
