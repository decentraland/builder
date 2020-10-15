import * as React from 'react'
import { Props } from './LeftPanel.types'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import './LeftPanel.css'

export default class LeftPanel extends React.PureComponent<Props> {
  render() {
    const { items, collections, selectedItemId, selectedCollectionId, visibleItems, onSetItems, bodyShape } = this.props
    const listItems = items.filter(item => (selectedCollectionId ? item.collectionId === selectedCollectionId : !item.collectionId))
    return (
      <div className="LeftPanel">
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
      </div>
    )
  }
}
