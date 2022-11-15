import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getEntities } from 'modules/scene/selectors'
import { getAssetsByEntityName } from 'modules/asset/selectors'

import { MapStateProps } from './EntityField.types'
import EntityField from './EntityField'

const mapState = (state: RootState): MapStateProps => ({
  entities: getEntities(state),
  assetsByEntityName: getAssetsByEntityName(state)
})

const mapDispatch = () => ({})

export default connect(mapState, mapDispatch)(EntityField)
