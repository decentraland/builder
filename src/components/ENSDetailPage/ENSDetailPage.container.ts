import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_ENS_REQUEST, fetchENSRequest } from 'modules/ens/actions'
import { getAvatar, getName } from 'modules/profile/selectors'
import { getWallet } from 'modules/wallet/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getENSBySubdomain, getLoading } from 'modules/ens/selectors'
import { RootState } from 'modules/common/types'
import { getENSName } from 'modules/location/selectors'
import { MapStateProps, MapDispatchProps } from './ENSDetailPage.types'
import ENSDetailPage from './ENSDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const name = getENSName()
  return {
    name,
    ens: name ? getENSBySubdomain(state, `${name}.dcl.eth`) : null,
    isLoading: isLoadingType(getLoading(state), FETCH_ENS_REQUEST),
    alias: getName(state),
    avatar: getAvatar(state),
    wallet: getWallet(state)
  }
}

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onFetchENS: (name: string) => dispatch(fetchENSRequest(name)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(ENSDetailPage)
