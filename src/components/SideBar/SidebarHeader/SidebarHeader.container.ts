import { connect } from 'react-redux'

import { getSub } from 'modules/auth/selectors'
import { RootState } from 'modules/common/types'
import { getSelectedCategory, getSelectedAssetPack, getSearch } from 'modules/ui/sidebar/selectors'
import { selectCategory, selectAssetPack, searchAssets } from 'modules/ui/sidebar/actions'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SidebarHeader.types'
import SidebarHeader from './SidebarHeader'

const mapState = (state: RootState): MapStateProps => ({
  selectedAssetPack: getSelectedAssetPack(state),
  selectedCategory: getSelectedCategory(state),
  userId: getSub(state),
  search: getSearch(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSelectCategory: category => dispatch(selectCategory(category)),
  onSelectAssetPack: assetPackId => dispatch(selectAssetPack(assetPackId)),
  onSearch: search => dispatch(searchAssets(search)),
  onEditAssetPack: (assetPackId: string) => dispatch(openModal('EditAssetPackModal', { assetPackId })),
  onCreateAssetPack: () => dispatch(openModal('CreateAssetPackModal'))
})

export default connect(
  mapState,
  mapDispatch
)(SidebarHeader)
