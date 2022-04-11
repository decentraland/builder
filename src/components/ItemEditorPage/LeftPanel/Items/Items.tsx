import * as React from 'react'
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized'
import { Header, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Item } from 'modules/item/types'
import { hasBodyShape } from 'modules/item/utils'
import SidebarItem from './SidebarItem'
import { Props, State } from './Items.types'
import 'react-virtualized/styles.css' // only needs to be imported once
import './Items.css'

const ITEM_ROW_HEIGHT = 52

export default class Items extends React.PureComponent<Props, State> {
  state = {
    items: this.props.items
  }
  componentDidUpdate() {
    const { items } = this.props
    const { items: stateItems } = this.state
    const prevItemIds = stateItems.map(prevItem => prevItem.id)
    if (items.some(item => !prevItemIds.includes(item.id))) {
      const newItems = [...stateItems, ...items.filter(item => !prevItemIds.includes(item.id))]
      this.setState({ items: newItems })
    }
  }
  isVisible = (item: Item) => {
    const { visibleItems } = this.props
    return visibleItems.some(_item => _item.id === item.id)
  }

  handleClick = (item: Item) => {
    const { visibleItems, onSetItems, bodyShape } = this.props
    if (!hasBodyShape(item, bodyShape)) return

    const newVisibleItemIds = visibleItems.filter(_item => _item.id !== item.id)
    if (!this.isVisible(item)) {
      newVisibleItemIds.push(item)
    }
    onSetItems(newVisibleItemIds)
  }

  rowRenderer = ({ key, index, style }: { key: string; index: number; style: any }) => {
    const { items } = this.state
    const { selectedItemId, selectedCollectionId, bodyShape } = this.props
    const item = items[index]
    return (
      <div key={key} style={{ ...style, height: '100%' }}>
        <SidebarItem
          key={item.id}
          item={item}
          isSelected={selectedItemId === item.id}
          isVisible={this.isVisible(item)}
          selectedCollectionId={selectedCollectionId}
          bodyShape={bodyShape}
          onClick={this.handleClick}
        />
      </div>
    )
  }

  isRowLoaded = ({ index }: { index: number }) => {
    const { items } = this.state
    return !!items[index]
  }

  loadMoreItems = async () => {
    const { selectedCollectionId, onLoadNextPage, totalItems } = this.props
    if (selectedCollectionId && totalItems) {
      onLoadNextPage()
    }
  }

  render() {
    const { items } = this.state
    console.log('items state: ', items);
    const { hasHeader, totalItems, selectedCollectionId, selectedItemId, bodyShape } = this.props
    console.log('totalItems: ', totalItems);
    console.log('bodyShape: ', bodyShape);
    if (items.length === 0 || !totalItems) return null

    return (
      <Section className="Items">
        {hasHeader ? <Header sub>{t('item_editor.left_panel.items')}</Header> : null}
        {selectedCollectionId ? (
          <InfiniteLoader isRowLoaded={this.isRowLoaded} loadMoreRows={this.loadMoreItems} rowCount={totalItems}>
            {({ onRowsRendered, registerChild }) => (
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    ref={registerChild}
                    width={width}
                    height={height}
                    rowCount={items.length}
                    rowHeight={ITEM_ROW_HEIGHT}
                    rowRenderer={this.rowRenderer}
                    onRowsRendered={onRowsRendered}
                  />
                )}
              </AutoSizer>
            )}
          </InfiniteLoader>
        ) : (
          items.map(item => (
            <SidebarItem
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              isVisible={this.isVisible(item)}
              selectedCollectionId={selectedCollectionId}
              bodyShape={bodyShape}
              onClick={this.handleClick}
            />
          ))
        )}
      </Section>
    )
  }
}
