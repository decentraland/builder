import { connect } from 'react-redux'

import { openModal } from 'modules/modal/actions'
import { RootState } from 'modules/common/types'
import { getSidebarAssetPacks } from 'modules/ui/sidebar/selectors'
import { selectAssetPack } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './AssetPackList.types'
import AssetPackList from './AssetPackList'

const mapState = (state: RootState): MapStateProps => ({
  assetPacks: getSidebarAssetPacks(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSelectAssetPack: assetPackId => dispatch(selectAssetPack(assetPackId)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(
  mapState,
  mapDispatch
)(AssetPackList)
