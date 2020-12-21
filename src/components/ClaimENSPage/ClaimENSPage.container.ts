import { connect } from 'react-redux'
import { push, goBack } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { allowClaimManaRequest, claimNameRequest, FETCH_ENS_LIST_REQUEST, ALLOW_CLAIM_MANA_REQUEST } from 'modules/ens/actions'
import { getLoading, isWaitingTxAllowMana, getAuthorizationByWallet } from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ClaimENSPage.types'
import ClaimENSPage from './ClaimENSPage'

const mapState = (state: RootState): MapStateProps => {
  const address = getAddress(state) || ''
  const authorization = getAuthorizationByWallet(state)

  return {
    address,
    allowance: authorization ? authorization.allowance : '0',
    isLoading:
      isLoadingType(getLoading(state), FETCH_ENS_LIST_REQUEST) ||
      isLoadingType(getLoading(state), ALLOW_CLAIM_MANA_REQUEST) ||
      isWaitingTxAllowMana(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onAllowMana: allowance => dispatch(allowClaimManaRequest(allowance)),
  onClaim: name => dispatch(claimNameRequest(name)),
  onNavigate: path => dispatch(push(path)),
  onBack: () => dispatch(goBack())
})

export default connect(mapState, mapDispatch)(ClaimENSPage)
