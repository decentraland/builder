import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getIsWorldContributorEnabled } from 'modules/features/selectors'
import { RootState } from 'modules/common/types'
import NameTabs from './NameTabs'
import { MapDispatch, MapDispatchProps } from './NameTabs.types'

const mapState = (state: RootState) => {
  return {
    isWorldContributorEnabled: getIsWorldContributorEnabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => {
  return {
    onNavigate: to => dispatch(push(to))
  }
}

export default connect(mapState, mapDispatch)(NameTabs)
