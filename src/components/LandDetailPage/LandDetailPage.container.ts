import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getOccuppiedParcels } from 'modules/deployment/selectors'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandDetailPage.types'
import LandDetailPage from './LandDetailPage'
import { openModal } from 'modules/modal/actions'
import { getParcelsAvailableToBuildEstates } from 'modules/land/selectors'

const mapState = (state: RootState): MapStateProps => ({
  parcelsAvailableToBuildEstates: getParcelsAvailableToBuildEstates(state),
  occupiedParcels: getOccuppiedParcels(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(LandDetailPage)
