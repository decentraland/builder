import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getOccuppiedParcels } from 'modules/deployment/selectors'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandDetailPage.types'
import LandDetailPage from './LandDetailPage'

const mapState = (state: RootState): MapStateProps => ({
  occupiedParcels: getOccuppiedParcels(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(LandDetailPage)
