import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection, CollectionType } from 'modules/collection/types'
import { getCollectionType } from 'modules/collection/utils'
import { Item } from 'modules/item/types'
import CollectionProvider from 'components/CollectionProvider'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import { Props } from './LeftPanel.types'
import './LeftPanel.css'

export default class LeftPanel extends React.PureComponent<Props> {
  getItems(collection: Collection | null, collectionItems: Item[]) {
    const { selectedCollectionId, orphanItems, isReviewing } = this.props
    if (selectedCollectionId && collection) {
      return getCollectionType(collection) === CollectionType.THIRD_PARTY && isReviewing
        ? collectionItems.filter(item => item.isPublished)
        : collectionItems
    }
    return orphanItems
  }

  render() {
    const {
      items: allItems,
      collections,
      selectedItemId,
      selectedCollectionId,
      visibleItems,
      bodyShape,
      isConnected,
      onSetItems,
      onSetCollection
    } = this.props

    return (
      <div className="LeftPanel">
        {isConnected ? (
          <CollectionProvider id={selectedCollectionId}>
            {(collection, collectionItems, _, isLoading) => {
              if (collection && isLoading) {
                return <Loader size="massive" active />
              }

              const items = this.getItems(collection, collectionItems)

              return items.length === 0 && collections.length === 0 ? (
                <>
                  <Header />
                  <div className="empty">
                    <div className="subtitle">{t('collections_page.empty_description')}</div>
                  </div>
                </>
              ) : (
                <>
                  <Header />
                  <Items
                    items={items}
                    hasHeader={!selectedCollectionId && collections.length > 0}
                    selectedItemId={selectedItemId}
                    selectedCollectionId={selectedCollectionId}
                    visibleItems={visibleItems}
                    bodyShape={bodyShape}
                    onSetItems={onSetItems}
                  />
                  {selectedCollectionId ? null : (
                    <Collections
                      collections={collections}
                      items={allItems}
                      hasHeader={items.length > 0}
                      selectedCollectionId={selectedCollectionId}
                      onSetCollection={onSetCollection}
                    />
                  )}
                </>
              )
            }}
          </CollectionProvider>
        ) : null}
      </div>
    )
  }
}
