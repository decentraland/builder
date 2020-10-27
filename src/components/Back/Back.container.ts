import { connect } from 'react-redux'
import { goBack } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { hasHistory } from 'modules/location/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './Back.types'
import Back from './Back'

const mapState = (state: RootState): MapStateProps => ({
  hasHistory: hasHistory(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onBack: () => dispatch(goBack())
})

export default connect(mapState, mapDispatch)(Back)
