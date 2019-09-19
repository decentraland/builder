import { connect } from 'react-redux'

import { getSub } from 'modules/auth/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { getSelectedCategory, getSelectedAssetPack, isList, getSearch } from 'modules/ui/sidebar/selectors'
import { setSidebarView, selectCategory, selectAssetPack, searchAssets } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SidebarHeader.types'
import SidebarHeader from './SidebarHeader'

const mapState = (state: RootState): MapStateProps => ({
  selectedAssetPack: getSelectedAssetPack(state),
  selectedCategory: getSelectedCategory(state),
  isList: isList(state),
  search: getSearch(state),
  userId: getSub(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetSidebarView: view => dispatch(setSidebarView(view)),
  onSelectCategory: category => dispatch(selectCategory(category)),
  onSelectAssetPack: assetPackId => dispatch(selectAssetPack(assetPackId)),
  onSearch: search => dispatch(searchAssets(search)),
  onEditAssetPack: (assetPackId: string) => dispatch(openModal('EditAssetPackModal', { assetPackId }))
})

export default connect(
  mapState,
  mapDispatch
)(SidebarHeader)
