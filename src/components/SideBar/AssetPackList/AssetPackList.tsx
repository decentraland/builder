import React from 'react'

import SidebarCard from '../SidebarCard'
import { Props } from './AssetPackList.types'

export default class AssetPackList extends React.PureComponent<Props> {
  render() {
    const { assetPacks, onSelectAssetPack } = this.props
    return assetPacks.map(assetPack => (
      <SidebarCard
        key={assetPack.id}
        id={assetPack.id}
        title={assetPack.title}
        thumbnail={assetPack.thumbnail}
        onClick={onSelectAssetPack}
        isVisible
      />
    ))
  }
}
