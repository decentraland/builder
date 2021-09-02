import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { isLoadingContentBySubdomain, isPendingContentBySubdomain } from 'modules/ens/selectors'
import { setENSContentRequest } from 'modules/ens/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ENSChip.types'
import ENSChip from './ENSChip'
import { locations } from 'routing/locations'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { ens } = ownProps
  return {
    isLoading: isLoadingContentBySubdomain(state)[ens.subdomain] || isPendingContentBySubdomain(state)[ens.subdomain]
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onUnsetENSContent: ens => dispatch(setENSContentRequest(ens, undefined, locations.activity()))
})

export default connect(mapState, mapDispatch)(ENSChip)
