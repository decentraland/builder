import * as React from 'react'
import { Loader } from 'decentraland-ui'
import CollectionProvider from 'components/CollectionProvider'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import { Props } from './LeftPanel.types'
import './LeftPanel.css'

export default class LeftPanel extends React.PureComponent<Props> {
  render() {
    const { items, orphanItems, collections, selectedItemId, selectedCollectionId, visibleItems, onSetItems, bodyShape } = this.props
    return (
      <div className="LeftPanel">
        <CollectionProvider id={selectedCollectionId}>
          {(_collection, collectionItems, isLoading) => {
            const listItems = selectedCollectionId ? collectionItems : orphanItems
            return isLoading ? (
              <Loader size="massive" active />
            ) : (
              <>
                <Header />
                <Items
                  items={listItems}
                  hasHeader={!selectedCollectionId && collections.length > 0}
                  selectedItemId={selectedItemId}
                  selectedCollectionId={selectedCollectionId}
                  visibleItems={visibleItems}
                  onSetItems={onSetItems}
                  bodyShape={bodyShape}
                />
                {selectedCollectionId ? null : (
                  <Collections
                    collections={collections}
                    items={items}
                    hasHeader={listItems.length > 0}
                    selectedCollectionId={selectedCollectionId}
                  />
                )}
              </>
            )
          }}
        </CollectionProvider>
      </div>
    )
  }
}
