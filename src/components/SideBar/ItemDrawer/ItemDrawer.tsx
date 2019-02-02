import * as React from 'react'
import { Header, Grid, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Drawer from 'components/Drawer'
import AssetCard from 'components/AssetCard'
import Chip from 'components/Chip'
import { Asset } from 'modules/asset/types'
import { Props, State } from './ItemDrawer.types'
import './ItemDrawer.css'
import { debounce } from 'lib/debounce'

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

  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.handleSearchDebounced(event.target.value)
  }

  handleSearchDebounced = debounce(this.props.onSearch, 200)

  render() {
    const { isList } = this.state
    const { categories, columnCount } = this.props

    return (
      <div className="ItemDrawer">
        <Header size="medium" className="title">
          {t('itemdrawer.title')}{' '}
          <div className="item-drawer-type-buttons">
            <Chip icon="grid" isActive={!isList} onClick={isList ? this.handleOnDrawerTypeClick : undefined} />
            <Chip icon="list" isActive={isList} onClick={isList ? undefined : this.handleOnDrawerTypeClick} />
          </div>
        </Header>

        <div className="search-container">
          <Icon name="search" />
          <input className="search" placeholder="Search..." onChange={this.handleSearch} />
        </div>

        <div className="overflow-container">
          {categories.map((category, index) => (
            <Drawer key={index} label={category.name}>
              <Grid columns={isList ? 1 : columnCount} padded="horizontally" className={`asset-grid ${isList ? 'item-list' : 'item-grid'}`}>
                {this.renderGrid(category.assets)}
              </Grid>
            </Drawer>
          ))}
        </div>
      </div>
    )
  }
}
