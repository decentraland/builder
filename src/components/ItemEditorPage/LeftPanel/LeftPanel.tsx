import * as React from 'react'
import { Loader, Tabs } from 'decentraland-ui'
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
import { Props, State, ItemEditorTabs } from './LeftPanel.types'
import './LeftPanel.css'

export const LEFT_PANEL_PAGE_SIZE = 20
const INITIAL_PAGE = 1

export default class LeftPanel extends React.PureComponent<Props, State> {
  state = {
    pages: [INITIAL_PAGE],
    currentTab: ItemEditorTabs.COLLECTIONS
  }

  fetchResource() {
    const { address, onFetchCollections, onFetchOrphanItems } = this.props
    const { pages } = this.state
    if (address) {
      const page = pages[pages.length - 1] // fetch new last page added, the previous ones were already fetched
      const fetchFn = this.isCollectionTabActive() ? onFetchCollections : onFetchOrphanItems
      fetchFn(address, { limit: LEFT_PANEL_PAGE_SIZE, page })
    }
  }

  componentDidMount() {
    this.fetchResource()
  }

  componentDidUpdate(prevProps: Props) {
    const { isConnected, address } = this.props
    // fetch only if this was triggered by a connecting event
    if (address && isConnected && isConnected !== prevProps.isConnected) {
      this.fetchResource()
    }
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
    const { pages } = this.state
    const { totalItems, totalCollections, selectedCollectionId } = this.props
    const totalResources = this.isCollectionTabActive() ? totalCollections : totalItems
    const totalPages = Math.ceil(totalResources! / LEFT_PANEL_PAGE_SIZE)
    if (!pages.includes(totalPages)) {
      const lastPage = pages[pages.length - 1]
      this.setState({ pages: [...pages, lastPage + 1] }, selectedCollectionId ? undefined : this.fetchResource)
    }
  }

  handleTabChange = (tab: ItemEditorTabs) => {
    this.setState({ currentTab: tab, pages: [INITIAL_PAGE] }, this.fetchResource)
  }

  isCollectionTabActive = () => {
    const { selectedCollectionId } = this.props
    const { currentTab } = this.state
    return currentTab === ItemEditorTabs.COLLECTIONS && !selectedCollectionId
  }

  render() {
    const {
      items: allItems,
      totalItems,
      totalCollections,
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
    const { pages } = this.state
    const showTabs = !selectedCollectionId
    const showCollections = this.isCollectionTabActive() && !selectedCollectionId
    const showItems = !this.isCollectionTabActive() || selectedCollectionId
    return (
      <div className="LeftPanel">
        {isConnected ? (
          <CollectionProvider
            id={selectedCollectionId}
            itemsPage={pages}
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
                  {showTabs ? (
                    <Tabs isFullscreen>
                      <Tabs.Tab active={this.isCollectionTabActive()} onClick={() => this.handleTabChange(ItemEditorTabs.COLLECTIONS)}>
                        {t('collections_page.collections')}
                      </Tabs.Tab>
                      <Tabs.Tab active={!this.isCollectionTabActive()} onClick={() => this.handleTabChange(ItemEditorTabs.ORPHAN_ITEMS)}>
                        {t('item_editor.left_panel.items')}
                      </Tabs.Tab>
                    </Tabs>
                  ) : null}
                  {showCollections ? (
                    <Collections
                      collections={collections}
                      totalCollections={totalCollections || collections.length}
                      items={allItems}
                      hasHeader={items.length > 0}
                      selectedCollectionId={selectedCollectionId}
                      onSetCollection={onSetCollection}
                      onLoadNextPage={this.loadNextPage}
                    />
                  ) : null}
                  {showItems ? (
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
                  ) : null}
                </>
              )
            }}
          </CollectionProvider>
        ) : null}
      </div>
    )
  }
}
