import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { sortByName } from 'lib/sort'
import { isThirdParty } from 'lib/urn'
import { Collection, CollectionType } from 'modules/collection/types'
import { CurationStatus } from 'modules/curations/types'
import { getCollectionType } from 'modules/collection/utils'
import { Item } from 'modules/item/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
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

  getItems(collection: Collection | null, collectionItems: Item[], itemCurations: ItemCuration[] | null) {
    const { selectedCollectionId, orphanItems, isReviewing } = this.props
    if (selectedCollectionId && collection) {
      return getCollectionType(collection) === CollectionType.THIRD_PARTY && isReviewing
        ? collectionItems.filter(
            item => item.isPublished && itemCurations?.find(curation => item.id === curation.itemId)?.status === CurationStatus.PENDING
          )
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
          <CollectionProvider
            id={selectedCollectionId}
            itemsPage={itemsPage}
            itemsPageSize={LEFT_PANEL_PAGE_SIZE}
            status={isReviewing ? CurationStatus.PENDING : undefined}
          >
            {({ collection, paginatedItems: collectionItems, isLoading, itemCurations }) => {
              const items = this.getItems(collection, collectionItems, itemCurations)
              const showLoader = isLoading && items.length === 0
              if (showLoader) {
                return <Loader size="massive" active />
              }

              if (items.length === 0 && collections.length === 0) {
                return (
                  <>
                    <Header />
                    <div className="empty">
                      <div className="subtitle">{t('collections_page.empty_description')}</div>
                    </div>
                  </>
                )
              } else if (items.length === 0 && selectedCollectionId) {
                return (
                  <>
                    <Header />
                    <div className="empty">
                      <div className="subtitle">
                        {isReviewing ? t('item_editor.left_panel.no_items_to_review') : t('item_editor.left_panel.empty_collection')}
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
                    items={!collection || !isThirdParty(collection.urn) ? items.sort(sortByName) : items}
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
