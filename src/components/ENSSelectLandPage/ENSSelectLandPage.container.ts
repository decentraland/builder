import { push } from 'connected-react-router'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { findBySubdomain } from 'modules/ens/utils'
import { getENSList } from 'modules/ens/selectors'
import { getLandTiles } from 'modules/land/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ENSSelectLandPage.types'
import ENSSelectLandPage from './ENSSelectLandPage'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { subdomain } = ownProps.match.params
  const ensList = getENSList(state)

  const ens = findBySubdomain(ensList, subdomain)!

  return {
    ens,
    landTiles: getLandTiles(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(ENSSelectLandPage)
