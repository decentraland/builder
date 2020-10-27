import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './NamesPage.types'
import { getState, getLoading } from 'modules/names/selectors'
import NamesPage from './NamesPage'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_NAMES_REQUEST } from 'modules/names/actions'

const mapState = (state: RootState): MapStateProps => ({
  names: getState(state),
  isLoading: isLoadingType(getLoading(state), FETCH_NAMES_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(NamesPage)
