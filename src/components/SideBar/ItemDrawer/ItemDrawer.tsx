import * as React from 'react'
import { Header, Grid, Icon, Input } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { SignInPage } from 'decentraland-dapps/dist/containers'
import { debounce } from 'lib/debounce'
import Drawer from 'components/Drawer'
import AssetCard from 'components/AssetCard'
import CategoryCard from 'components/CategoryCard'
import Chip from 'components/Chip'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { SidebarView } from 'modules/ui/sidebar/types'
import { CategoryName } from 'modules/ui/sidebar/utils'
import { Props, State, DefaultProps } from './ItemDrawer.types'
import './ItemDrawer.css'

const DEFAULT_COLUMN_COUNT = 3
const CTRL_KEY_CODE = 17
const COMMAND_KEY_CODE = 91
const Z_KEY_CODE = 90

export default class ItemDrawer extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    columnCount: DEFAULT_COLUMN_COUNT,
    onClick: (_: Asset) => {
      /* noop */
    }
  }

  isCtrlDown = false
  drawerContainer: HTMLElement | null = null

  state = {
    isList: false,
    search: this.props.search
  }

  handleSearchDebounced = debounce((value: string) => {
    this.scrollItemsToTop()
    this.props.onSearch(value)
  }, 200)

  componentWillMount() {
    document.body.addEventListener('keydown', this.handleKeyDown)
    document.body.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKeyDown)
    document.body.removeEventListener('keyup', this.handleKeyUp)
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.search.length > 0 && nextProps.search.length === 0 && this.state.search.length > 0) {
      this.setState({ search: '' })
    }
  }

  handleKeyDown = (e: KeyboardEvent) => {
    // ctrl or command
    if (e.keyCode === CTRL_KEY_CODE || e.keyCode === COMMAND_KEY_CODE) {
      this.isCtrlDown = true
    }

    // z key
    if (this.isCtrlDown && e.keyCode === Z_KEY_CODE) {
      e.preventDefault() // prevent ctrl+z on the editor from changing the value of the search input
      return false
    }

    return true
  }

  handleKeyUp = (e: KeyboardEvent) => {
    // ctrl or command
    if (e.keyCode === CTRL_KEY_CODE || e.keyCode === COMMAND_KEY_CODE) {
      this.isCtrlDown = false
    }
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

  handleSetGridView = () => {
    this.props.onSetSidebarView(SidebarView.GRID)
  }

  handleSetListView = () => {
    this.props.onSetSidebarView(SidebarView.LIST)
  }

  renderGrid = (assets: Asset[]) => {
    const { view } = this.props
    const columnCount = this.getColumnCount()
    let el = []

    for (let i = 0; i < assets.length; i += columnCount) {
      let row = []

      for (let j = i; j < i + columnCount; j++) {
        const item = assets[j]
        if (!item) break

        row.push(
          <Grid.Column key={item.id}>
            <AssetCard
              asset={item}
              isHorizontal={view === SidebarView.LIST}
              onClick={this.handleClick}
              onBeginDrag={this.handleBeginDrag}
            />
          </Grid.Column>
        )
      }

      el.push(<Grid.Row key={assets[i].id}>{row}</Grid.Row>)
    }

    return el
  }

  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search: event.target.value })
    this.handleSearchDebounced(event.target.value)
  }

  handleCleanSearch = () => {
    this.setState({ search: '' })
    this.handleSearchDebounced('')
  }

  scrollItemsToTop = () => {
    if (this.drawerContainer) {
      this.drawerContainer.scrollTop = 0
    }
  }

  setDrawerContainer = (ref: HTMLElement | null) => {
    if (!this.drawerContainer) {
      this.drawerContainer = ref
    }
  }

  getColumnCount = (): number => {
    return Number(this.props.columnCount)
  }

  renderNoResults = () => {
    return <div className="no-results">{t('itemdrawer.no_results')}</div>
  }

  renderCategories = () => {
    const { categories, onSelectCategory } = this.props
    const assetPackCategories = categories.map(category => (
      <CategoryCard key={`category-${category.name}`} category={category} onClick={onSelectCategory} />
    ))
    return assetPackCategories
  }

  handleGoBack = () => {
    const { onSelectCategory } = this.props
    onSelectCategory(null)
  }

  isInCategory = (category: CategoryName) => {
    const { categories } = this.props
    return categories.length === 1 && categories[0].name === category
  }

  renderItemDrawerContent = () => {
    const { search, categories, selectedCategory, columnCount, view } = this.props
    const isList = view === SidebarView.LIST

    if (search.length > 0 && categories.length === 0) {
      return this.renderNoResults()
    }

    if (!isList && !selectedCategory && search.length === 0) {
      return this.renderCategories()
    }

    if (this.isInCategory(CategoryName.COLLECTIBLE_CATEGORY) && categories[0].assets.length === 0) {
      return <SignInPage />
    }

    return categories.map(category => (
      <Drawer key={`drawer-${category.name}`} label={category.name} hasLabel={selectedCategory === null && categories.length > 1}>
        <Grid columns={isList ? 1 : columnCount} padded="horizontally" className={`asset-grid ${isList ? 'item-list' : 'item-grid'}`}>
          {this.renderGrid(category.assets)}
        </Grid>
      </Drawer>
    ))
  }

  render() {
    const { search, selectedCategory, view } = this.props
    const isList = view === SidebarView.LIST

    return (
      <div className="ItemDrawer">
        <Header size="medium" className="title">
          {selectedCategory === null ? (
            t('itemdrawer.title')
          ) : (
            <span className="selected-category" onClick={this.handleGoBack}>
              <Icon name="chevron left" />
              {selectedCategory}
            </span>
          )}{' '}
          {!selectedCategory ? (
            <div className="item-drawer-type-buttons">
              <Chip icon="grid" isActive={!isList} onClick={this.handleSetGridView} />
              <Chip icon="list" isActive={isList} onClick={this.handleSetListView} />
            </div>
          ) : null}
        </Header>

        {!this.isInCategory(CategoryName.COLLECTIBLE_CATEGORY) && (
          <div className="search-container">
            <Icon name="search" />
            <Input
              className="search-input"
              placeholder={
                selectedCategory === null ? t('itemdrawer.search') : t('itemdrawer.search_category', { category: selectedCategory })
              }
              icon={search.length > 0 ? { name: 'close', size: 'small', onClick: this.handleCleanSearch } : null}
              value={this.state.search}
              onChange={this.handleSearch}
            />
          </div>
        )}

        <div ref={this.setDrawerContainer} className="overflow-container">
          {this.renderItemDrawerContent()}
        </div>
      </div>
    )
  }
}
