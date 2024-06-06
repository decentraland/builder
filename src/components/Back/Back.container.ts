import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { hasHistory } from 'modules/location/selectors'
import { MapStateProps } from './Back.types'
import Back from './Back'

const mapState = (state: RootState): MapStateProps => ({
  hasHistory: hasHistory(state)
})

export default connect(mapState)(Back)
