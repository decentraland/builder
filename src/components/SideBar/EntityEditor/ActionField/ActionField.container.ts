import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getAssetsWithScriptByEntityName } from 'modules/scene/selectors'

import { MapStateProps } from './ActionField.types'
import ActionField from './ActionField'

const mapState = (state: RootState): MapStateProps => ({
  entityAssets: getAssetsWithScriptByEntityName(state)
})

const mapDispatch = () => ({})

export default connect(
  mapState,
  mapDispatch
)(ActionField)
