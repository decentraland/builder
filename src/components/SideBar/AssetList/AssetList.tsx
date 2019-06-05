import React from 'react'
import { Grid } from 'decentraland-ui'

import Drawer from 'components/Drawer'
import AssetCard from 'components/AssetCard'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'

import { Props, DefaultProps } from './AssetList.types'
import './AssetList.css'

const DEFAULT_COLUMN_COUNT = 3

export default class AssetList extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    columnCount: DEFAULT_COLUMN_COUNT
  }

  getColumnCount(): number {
    return Number(this.props.columnCount)
  }

  handleClick = (asset: Asset) => {
    if (asset.category === GROUND_CATEGORY) {
      const { currentProject, onSetGround } = this.props
      if (currentProject) {
        onSetGround(currentProject.id, currentProject.layout, asset)
      }
    } else {
      const { onAddItem } = this.props
      onAddItem(asset)
    }
  }

  handleBeginDrag = (asset: Asset) => {
    if (asset.category !== GROUND_CATEGORY) {
      const { onPrefetchAsset } = this.props
      onPrefetchAsset(asset)
    }
  }

  renderGrid(assets: Asset[]) {
    const { isList } = this.props
    const columnCount = this.getColumnCount()
    let el = []

    for (let i = 0; i < assets.length; i += columnCount) {
      let row = []

      for (let j = i; j < i + columnCount; j++) {
        const item = assets[j]
        if (!item) break

        row.push(
          <Grid.Column key={item.id}>
            <AssetCard asset={item} isHorizontal={isList} onClick={this.handleClick} onBeginDrag={this.handleBeginDrag} />
          </Grid.Column>
        )
      }

      el.push(<Grid.Row key={assets[i].id}>{row}</Grid.Row>)
    }

    return el
  }

  render() {
    const { category, isList, columnCount, hasLabel } = this.props
    return (
      <Drawer className="AssetList" key={`drawer-${category.name}`} label={category.name} hasLabel={hasLabel}>
        <Grid columns={isList ? 1 : columnCount} padded="horizontally" className={`asset-grid ${isList ? 'item-list' : 'item-grid'}`}>
          {this.renderGrid(category.assets)}
        </Grid>
      </Drawer>
    )
  }
}
