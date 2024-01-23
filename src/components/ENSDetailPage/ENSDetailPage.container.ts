import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { push } from 'connected-react-router'
import { getENSBySubdomain, getLoading } from 'modules/ens/selectors'
import { RootState } from 'modules/common/types'
import { getENSName } from 'modules/location/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps } from './ENSDetailPage.types'
import ENSDetailPage from './ENSDetailPage'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_ENS_REQUEST, fetchENSRequest } from 'modules/ens/actions'
import { getAvatar, getName } from 'modules/profile/selectors'

const mapState = (state: RootState): MapStateProps => {
  const name = getENSName(state)
  return {
    name,
    ens: name ? getENSBySubdomain(state, `${name}.dcl.eth`) : null,
    isLoading: isLoadingType(getLoading(state), FETCH_ENS_REQUEST),
    alias: getName(state),
    avatar: getAvatar(state)
  }
}

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onFetchENS: (name: string) => dispatch(fetchENSRequest(name)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(ENSDetailPage)
