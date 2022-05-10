import * as React from 'react'
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized'
import { Section } from 'decentraland-ui'
import SidebarCollection from './SidebarCollection'
import { Props } from './Collections.types'
import './Collections.css'

const COLLECTION_ROW_HEIGHT = 80

export default class Collections extends React.PureComponent<Props> {
  state = {
    collections: this.props.collections
  }
  componentDidUpdate() {
    const { collections } = this.props
    const { collections: stateCollections } = this.state
    const prevCollectionIds = stateCollections.map(prevItem => prevItem.id)
    if (collections.some(c => !prevCollectionIds.includes(c.id))) {
      const newCollections = [...stateCollections, ...collections.filter(c => !prevCollectionIds.includes(c.id))]
      this.setState({ collections: newCollections })
    }
  }

  rowRenderer = ({ key, index, style }: { key: string; index: number; style?: any }) => {
    const { collections } = this.state
    const { selectedCollectionId, onSetCollection, items } = this.props
    const collection = collections[index]
    return (
      <div key={key} style={style}>
        <SidebarCollection
          key={collection.id}
          collection={collection}
          items={items}
          isSelected={collection.id === selectedCollectionId}
          onSetCollection={onSetCollection}
        />
      </div>
    )
  }

  isRowLoaded = ({ index }: { index: number }) => {
    const { collections } = this.state
    return !!collections[index]
  }

  loadMoreCollections = async () => {
    const { onLoadNextPage, totalCollections } = this.props
    if (totalCollections) {
      onLoadNextPage()
    }
  }

  render() {
    const { collections, totalCollections } = this.props
    if (collections.length === 0) return null

    return (
      <Section className="Collections">
        <InfiniteLoader isRowLoaded={this.isRowLoaded} loadMoreRows={this.loadMoreCollections} rowCount={totalCollections}>
          {({ onRowsRendered, registerChild }) => (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  ref={registerChild}
                  width={width}
                  height={height}
                  rowCount={collections.length}
                  rowHeight={COLLECTION_ROW_HEIGHT}
                  rowRenderer={this.rowRenderer}
                  onRowsRendered={onRowsRendered}
                />
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </Section>
    )
  }
}
