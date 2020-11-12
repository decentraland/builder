import { push, goBack } from 'connected-react-router'
import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { findBySubdomain } from 'modules/ens/utils'
import { getENSList, getLoading as getENSLoading } from 'modules/ens/selectors'
import { getLandTiles, isLoading as isLandLoading } from 'modules/land/selectors'
import { isLoggingIn } from 'modules/identity/selectors'
import { FETCH_DOMAIN_LIST_REQUEST } from 'modules/ens/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ENSSelectLandPage.types'
import ENSSelectLandPage from './ENSSelectLandPage'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { subdomain } = ownProps.match.params
  const ensList = getENSList(state)

  const ens = findBySubdomain(ensList, subdomain)!

  return {
    ens,
    isLoading:
      isLoggingIn(state) || isConnecting(state) || isLoadingType(getENSLoading(state), FETCH_DOMAIN_LIST_REQUEST) || isLandLoading(state),
    landTiles: getLandTiles(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onBack: () => dispatch(goBack())
})

export default connect(mapState, mapDispatch)(ENSSelectLandPage)
