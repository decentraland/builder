import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { sortByName } from 'lib/sort'
import { Collection, CollectionType } from 'modules/collection/types'
import { getCollectionType } from 'modules/collection/utils'
import { Item } from 'modules/item/types'
import CollectionProvider from 'components/CollectionProvider'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import { Props } from './LeftPanel.types'
import './LeftPanel.css'

export const LEFT_PANEL_PAGE_SIZE = 50
const INITIAL_PAGE = 1

export default class LeftPanel extends React.PureComponent<Props> {
  state = {
    itemsPage: [INITIAL_PAGE]
  }
  getItems(collection: Collection | null, collectionItems: Item[]) {
    const { selectedCollectionId, orphanItems, isReviewing } = this.props
    if (selectedCollectionId && collection) {
      return getCollectionType(collection) === CollectionType.THIRD_PARTY && isReviewing
        ? collectionItems.filter(item => item.isPublished)
        : collectionItems
    }
    return orphanItems
  }

  loadNextPage = () => {
    const { totalItems } = this.props
    const { itemsPage } = this.state
    const totalPages = Math.ceil(totalItems! / LEFT_PANEL_PAGE_SIZE)
    if (!itemsPage.includes(totalPages)) {
      const lastPage = itemsPage[itemsPage.length - 1]
      this.setState({ itemsPage: [...itemsPage, lastPage + 1] })
    }
  }

  render() {
    const {
      items: allItems,
      totalItems,
      collections,
      selectedItemId,
      selectedCollectionId,
      visibleItems,
      bodyShape,
      isReviewing,
      isConnected,
      onSetItems,
      onSetCollection
    } = this.props
    const { itemsPage } = this.state
    return (
      <div className="LeftPanel">
        {isConnected ? (
          <CollectionProvider id={selectedCollectionId} itemsPage={itemsPage} itemsPageSize={LEFT_PANEL_PAGE_SIZE}>
            {({ collection, paginatedItems: collectionItems, isLoading }) => {
              const items = this.getItems(collection, collectionItems)
              const showLoader = isLoading && items.length === 0
              if (showLoader) {
                return <Loader size="massive" active />
              }

              if (items.length === 0 && collections.length === 0) {
                return (
                  <>
                    <Header />
                    <div className="empty">
                      <div className="subtitle">
                        {collections.length === 0
                          ? t('collections_page.empty_description')
                          : isReviewing
                          ? t('item_editor.left_panel.no_items_to_review')
                          : t('item_editor.left_panel.empty_collection')}
                      </div>
                    </div>
                  </>
                )
              }

              return (
                <>
                  <Header />
                  {selectedCollectionId ? null : (
                    <Collections
                      collections={collections}
                      items={allItems}
                      hasHeader={items.length > 0}
                      selectedCollectionId={selectedCollectionId}
                      onSetCollection={onSetCollection}
                    />
                  )}
                  <Items
                    items={items.sort(sortByName)}
                    totalItems={totalItems || items.length}
                    hasHeader={!selectedCollectionId && collections.length > 0}
                    selectedItemId={selectedItemId}
                    selectedCollectionId={selectedCollectionId}
                    visibleItems={visibleItems}
                    bodyShape={bodyShape}
                    onSetItems={onSetItems}
                    onLoadNextPage={this.loadNextPage}
                  />
                </>
              )
            }}
          </CollectionProvider>
        ) : null}
      </div>
    )
  }
}
