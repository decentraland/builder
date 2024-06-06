import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getTiles } from 'modules/tile/selectors'
import { getLandTiles } from 'modules/land/selectors'
import { getEmptyTiles } from 'modules/deployment/selectors'
import { MapStateProps } from './Atlas.types'
import Atlas from './Atlas'

const mapState = (state: RootState): MapStateProps => ({
  landTiles: getLandTiles(state),
  emptyTiles: getEmptyTiles(state),
  atlasTiles: getTiles(state)
})

export default connect(mapState)(Atlas)
