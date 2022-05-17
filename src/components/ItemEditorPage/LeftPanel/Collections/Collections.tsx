import * as React from 'react'
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized'
import { Loader, Section } from 'decentraland-ui'
import SidebarCollection from './SidebarCollection'
import { Props, State } from './Collections.types'
import './Collections.css'

const COLLECTION_ROW_HEIGHT = 80

export default class Collections extends React.PureComponent<Props, State> {
  state: State = {
    collections: this.props.collections,
    resolveNextPagePromise: null
  }
  componentDidUpdate() {
    const { collections } = this.props
    const { collections: stateCollections, resolveNextPagePromise } = this.state
    const prevCollectionIds = stateCollections.map(prevCollection => prevCollection.id)
    if (collections.some(c => !prevCollectionIds.includes(c.id))) {
      // if there was a promise pending, let's resolve it
      if (resolveNextPagePromise) {
        resolveNextPagePromise()
      }
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
    const promise = new Promise<void>(resolve => {
      // set the resolve fn in the state so it's call later when the items are updated
      this.setState({ resolveNextPagePromise: resolve })
    })
    return promise
  }

  render() {
    const { collections } = this.state
    const { totalCollections, isLoading } = this.props
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
        {isLoading ? <Loader size="small" active /> : null}
      </Section>
    )
  }
}
