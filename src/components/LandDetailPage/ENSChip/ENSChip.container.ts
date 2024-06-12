import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import { isLoadingContentBySubdomain, isPendingContentBySubdomain } from 'modules/ens/selectors'
import { MapStateProps, OwnProps } from './ENSChip.types'
import ENSChip from './ENSChip'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { ens } = ownProps
  return {
    isLoading: isLoadingContentBySubdomain(state)[ens.subdomain] || isPendingContentBySubdomain(state)[ens.subdomain]
  }
}

export default connect(mapState)(withRouter(ENSChip))
