import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { isLoadingContentBySubdomain, isPendingContentBySubdomain } from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ENSChip.types'
import ENSChip from './ENSChip'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { ens } = ownProps
  return {
    isLoading: isLoadingContentBySubdomain(state)[ens.subdomain] || isPendingContentBySubdomain(state)[ens.subdomain]
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(ENSChip)
