import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getLands, isLoading } from 'modules/land/selectors'
import { getLandPageView } from 'modules/ui/land/selectors'
import { setLandPageView } from 'modules/ui/land/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './LandPage.types'
import LandPage from './LandPage'

const mapState = (state: RootState): MapStateProps => ({
  lands: getLands(state),
  view: getLandPageView(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetView: view => dispatch(setLandPageView(view))
})

export default connect(mapState, mapDispatch)(LandPage)
