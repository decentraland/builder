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

  isCtrlDown = false

  state = {
    isList: false
  }

  handleSearchDebounced = debounce(this.props.onSearch, 200)

  componentWillMount() {
    document.body.addEventListener('keydown', this.handleKeyDown)
    document.body.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKeyDown)
    document.body.removeEventListener('keyup', this.handleKeyUp)
  }

  handleKeyDown = (e: KeyboardEvent) => {
    // ctrl or command
    if (e.keyCode === 17 || e.keyCode === 91) {
      this.isCtrlDown = true
    }
    // z key
    if (this.isCtrlDown && e.keyCode === 90) {
      e.preventDefault() // prevent ctrl+z on the editor from changing the value of the search input
      return false
    }
  }

  handleKeyUp = (e: KeyboardEvent) => {
    // ctrl or command
    if (e.keyCode === 17 || e.keyCode === 91) {
      this.isCtrlDown = false
    }
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
