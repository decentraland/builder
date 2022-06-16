import * as React from 'react'
import { Loader, Tabs } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { sortByName } from 'lib/sort'
import { isThirdParty } from 'lib/urn'
import { Collection, CollectionType } from 'modules/collection/types'
import { CurationStatus } from 'modules/curations/types'
import { getCollectionType } from 'modules/collection/utils'
import { Item } from 'modules/item/types'
import CollectionProvider from 'components/CollectionProvider'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import { LEFT_PANEL_PAGE_SIZE } from '../constants'
import { Props, State, ItemEditorTabs } from './LeftPanel.types'
import './LeftPanel.css'

const INITIAL_PAGE = 1

export default class LeftPanel extends React.PureComponent<Props, State> {
  state = {
    pages: [INITIAL_PAGE],
    currentTab: ItemEditorTabs.COLLECTIONS
  }

  fetchResource() {
    const { address, onFetchCollections, onFetchOrphanItems, isReviewing, selectedCollectionId } = this.props
    const { pages } = this.state
    // this is for the items editor base view, if a collection is selected, the logic will be handled in the collection provider
    if (address && !isReviewing && !selectedCollectionId) {
      const page = pages[pages.length - 1] // fetch new last page added, the previous ones were already fetched
      const fetchFn = this.isCollectionTabActive() ? onFetchCollections : onFetchOrphanItems
      fetchFn(address, { limit: LEFT_PANEL_PAGE_SIZE, page })
    }
  }

  componentDidMount() {
    this.fetchResource()
  }

  componentDidUpdate(prevProps: Props) {
    const { isConnected, address, selectedCollectionId } = this.props
    // fetch only if this was triggered by a connecting event or if th selectedCollection changes
    if (address && isConnected && (isConnected !== prevProps.isConnected || (prevProps.selectedCollectionId && !selectedCollectionId))) {
      this.setState({ pages: [INITIAL_PAGE] }, this.fetchResource)
    }
    if (prevProps.selectedCollectionId !== selectedCollectionId) {
      this.setState({ pages: [INITIAL_PAGE] })
    }
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

  loadPage = (page: number) => {
    this.setState({ pages: [page] }, this.fetchResource)
  }

  loadRandomPage = (currentItems: Item[]) => {
    const { pages } = this.state
    const { totalItems, totalCollections, onSetReviewedItems } = this.props
    const totalResources = this.isCollectionTabActive() ? totalCollections : totalItems
    const totalPages = Math.ceil(totalResources! / LEFT_PANEL_PAGE_SIZE)
    let randomPage
    while (!randomPage) {
      randomPage = Math.floor(Math.random() * totalPages)
      if (pages.includes(randomPage)) {
        randomPage = null
      }
    }
    onSetReviewedItems(currentItems)
    this.setState({ pages: [randomPage] }, this.fetchResource)
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
      onSetCollection,
      isLoading: isLoadingOrphanItems,
      onSetReviewedItems
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
            {({ paginatedCollections, collection, paginatedItems: collectionItems, isLoading }) => {
              const items = this.getItems(collection, collectionItems)
              const isCollectionTab = this.isCollectionTabActive()
              const showLoader = isLoading && ((isCollectionTab && collections.length === 0) || (!isCollectionTab && items.length === 0))
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
                      <Tabs.Tab active={isCollectionTab} onClick={() => this.handleTabChange(ItemEditorTabs.COLLECTIONS)}>
                        {t('collections_page.collections')}
                      </Tabs.Tab>
                      <Tabs.Tab active={!isCollectionTab} onClick={() => this.handleTabChange(ItemEditorTabs.ORPHAN_ITEMS)}>
                        {t('item_editor.left_panel.items')}
                      </Tabs.Tab>
                    </Tabs>
                  ) : null}
                  {showCollections ? (
                    <Collections
                      collections={paginatedCollections}
                      totalCollections={totalCollections || collections.length}
                      items={allItems}
                      hasHeader={items.length > 0}
                      selectedCollectionId={selectedCollectionId}
                      onSetCollection={onSetCollection}
                      onLoadPage={this.loadPage}
                      isLoading={isLoading}
                    />
                  ) : null}
                  {showItems ? (
                    <Items
                      items={!collection || !isThirdParty(collection.urn) ? items.sort(sortByName) : items}
                      totalItems={totalItems || items.length}
                      hasHeader={!selectedCollectionId && collections.length > 0}
                      selectedItemId={selectedItemId}
                      selectedCollectionId={selectedCollectionId}
                      isReviewing={isReviewing}
                      visibleItems={visibleItems}
                      bodyShape={bodyShape}
                      onSetItems={onSetItems}
                      isLoading={isLoading || isLoadingOrphanItems}
                      onLoadRandomPage={() => this.loadRandomPage(items)}
                      onLoadPage={this.loadPage}
                      onSetReviewedItems={onSetReviewedItems}
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
