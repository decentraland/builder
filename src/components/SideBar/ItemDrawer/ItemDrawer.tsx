import * as React from 'react'
import { Header, Grid } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Drawer from 'components/Drawer'
import AssetCard from 'components/AssetCard'
import { Asset } from 'modules/asset/types'
import { Props, State } from './ItemDrawer.types'
import './ItemDrawer.css'
import EditorButton from 'components/EditorButton'

const DEFAULT_COLUMN_COUNT = 3

export default class ItemDrawer extends React.PureComponent<Props, State> {
  static defaultProps = {
    columnCount: DEFAULT_COLUMN_COUNT,
    onClick: () => {
      /* noop */
    }
  }

  state = {
    isList: false
  }

  handleOnClick = (asset: Asset) => {
    this.props.onClick(asset)
  }

  handleOnDrawerTypeClick = () => {
    this.setState({
      isList: !this.state.isList
    })
  }

  renderGrid(assets: Asset[]) {
    const { isList } = this.state
    const columnCount = this.getColumnCount()
    let el = []

    for (let i = 0; i < assets.length; i += columnCount) {
      let row = []

      for (let j = i; j < i + columnCount; j++) {
        const item = assets[j]
        if (!item) break

        row.push(
          <Grid.Column key={item.id}>
            <AssetCard asset={item} isHorizontal={isList} onClick={this.handleOnClick} />
          </Grid.Column>
        )
      }

      el.push(<Grid.Row key={i}>{row}</Grid.Row>)
    }

    return el
  }

  getColumnCount(): number {
    return Number(this.props.columnCount)
  }

  render() {
    const { isList } = this.state
    const { categories, columnCount } = this.props

    return (
      <div className="ItemDrawer">
        <Header size="medium" className="title">
          {t('itemDrawer.title')}{' '}
          <div className="item-drawer-type-buttons">
            <EditorButton name="grid" isActive={!isList} onClick={isList ? this.handleOnDrawerTypeClick : undefined} />
            <EditorButton name="list" isActive={isList} onClick={isList ? undefined : this.handleOnDrawerTypeClick} />
          </div>
        </Header>

        {categories.map((category, index) => (
          <Drawer key={index} label={category.name}>
            <Grid columns={isList ? 1 : columnCount} padded="horizontally" className={`asset-grid ${isList ? 'item-list' : 'item-grid'}`}>
              {this.renderGrid(category.assets)}
            </Grid>
          </Drawer>
        ))}
      </div>
    )
  }
}
