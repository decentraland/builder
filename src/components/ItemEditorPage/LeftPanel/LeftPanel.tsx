import * as React from 'react'
import { Props } from './LeftPanel.types'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import './LeftPanel.css'

export default class LeftPanel extends React.PureComponent<Props> {
  render() {
    const { items, collections, selectedItemId, selectedCollectionId, onNavigate } = this.props
    const listItems = items.filter(item => (selectedCollectionId ? item.collectionId === selectedCollectionId : !item.collectionId))
    return (
      <div className="LeftPanel">
        <Header />
        <Items
          items={listItems}
          hasHeader={!selectedCollectionId && collections.length > 0}
          onNavigate={onNavigate}
          selectedItemId={selectedItemId}
          selectedCollectionId={selectedCollectionId}
        />
        {selectedCollectionId ? null : (
          <Collections
            collections={collections}
            items={items}
            hasHeader={listItems.length > 0}
            onNavigate={onNavigate}
            selectedCollectionId={selectedCollectionId}
          />
        )}
      </div>
    )
  }
}
