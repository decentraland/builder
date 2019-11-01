import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getAssetsWithScriptByEntityId } from 'modules/scene/selectors'

import { MapStateProps } from './ActionField.types'
import ActionField from './ActionField'

const mapState = (state: RootState): MapStateProps => ({
  entityAssets: getAssetsWithScriptByEntityId(state)
})

const mapDispatch = () => ({})

export default connect(
  mapState,
  mapDispatch
)(ActionField)
