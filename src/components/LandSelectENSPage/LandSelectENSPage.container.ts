import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import { fetchENSRequest } from 'modules/ens/actions'
import { getENSList } from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandSelectENSPage.types'
import LandSelectENSPage from './LandSelectENSPage'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSList(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchENS: (name, land) => dispatch(fetchENSRequest(name, land))
})

export default connect(mapState, mapDispatch)(withRouter(LandSelectENSPage))
