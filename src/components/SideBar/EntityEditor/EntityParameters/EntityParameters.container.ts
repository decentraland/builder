import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getEntityNames } from 'modules/scene/selectors'
import { MapStateProps } from './EntityParameters.types'
import EntityEditor from './EntityParameters'

const mapState = (state: RootState): MapStateProps => ({
  entityNames: getEntityNames(state)
})

const mapDispatch = () => ({})

export default connect(mapState, mapDispatch)(EntityEditor)
