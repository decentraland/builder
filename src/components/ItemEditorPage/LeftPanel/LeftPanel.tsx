import * as React from 'react'
import { Tabs } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import { CurationStatus } from 'modules/curations/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { isThirdPartyCollection } from 'modules/collection/utils'
import { Item, ItemType } from 'modules/item/types'
import CollectionProvider from 'components/CollectionProvider'
import { ItemAddedToast } from './Toasts/ItemAdded'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import { LEFT_PANEL_PAGE_SIZE } from '../constants'
import { Props, State, ItemEditorTabs } from './LeftPanel.types'
import './LeftPanel.css'

const INITIAL_PAGE = 1

export default class LeftPanel extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState() {
    const { selectedCollectionId, selectedItemId } = this.props
    let currentTab = ItemEditorTabs.COLLECTIONS

    if (!selectedCollectionId && selectedItemId) {
      currentTab = ItemEditorTabs.ORPHAN_ITEMS
    }

    return {
      pages: [INITIAL_PAGE],
      currentTab,
      initialPage: INITIAL_PAGE,
      showSamplesModalAgain: true
    }
  }

  handleToggleShowSamplesModalAgain = () => {
    this.setState(prev => ({ showSamplesModalAgain: !prev.showSamplesModalAgain }))
  }

  fetchResource = () => {
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
    const { address, hasUserOrphanItems, selectedItem, onFetchOrphanItem, onSetItems } = this.props
    this.fetchResource()
    // TODO: Remove this call when there are no users with orphan items
    if (address && hasUserOrphanItems === undefined) {
      onFetchOrphanItem(address)
    }

    if (selectedItem) {
      onSetItems([selectedItem])
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      isConnected,
      address,
      selectedCollectionId,
      selectedItemId,
      selectedItem,
      orphanItems,
      totalItems,
      visibleItems,
      hasUserOrphanItems,
      onSetItems,
      onFetchOrphanItem
    } = this.props
    const { initialPage, pages } = this.state
    // when a newly created item redirects to the item editor, iterate over the pages until finding it
    if (
      !selectedCollectionId &&
      address &&
      selectedItemId &&
      totalItems &&
      (initialPage === INITIAL_PAGE || prevState.initialPage < initialPage)
    ) {
      if (!orphanItems.find(item => item.id === selectedItemId)) {
        const totalPages = Math.ceil(totalItems / LEFT_PANEL_PAGE_SIZE)
        const page = pages[pages.length - 1]
        const nextPage = Math.min(totalPages, page + 1)
        if (!pages.includes(nextPage)) {
          this.setState({ pages: [nextPage], initialPage: nextPage }, this.fetchResource)
        }
      }
    } else if (prevProps.selectedItemId && selectedItemId && prevProps.selectedItemId !== selectedItemId) {
      const items = visibleItems.filter(item => item.type !== ItemType.EMOTE)
      onSetItems(items)
    } else {
      // fetch only if this was triggered by a connecting event or if th selectedCollection changes
      if (address && isConnected && (isConnected !== prevProps.isConnected || (prevProps.selectedCollectionId && !selectedCollectionId))) {
        this.setState({ pages: [INITIAL_PAGE] }, this.fetchResource)
      }
      if (prevProps.selectedCollectionId !== selectedCollectionId) {
        this.setState({ pages: [INITIAL_PAGE] })
      }
      // TODO: Remove this call when there are no users with orphan items
      if (address && address !== prevProps.address && hasUserOrphanItems === undefined) {
        onFetchOrphanItem(address)
      }
    }

    // Preselect item when clicking on a collection
    if (!prevProps.selectedItem && selectedItem && selectedItem.type !== ItemType.EMOTE) {
      onSetItems([selectedItem])
    }

    // Clear visible items when changing collection
    if (prevProps.selectedCollectionId !== selectedCollectionId) {
      onSetItems([])
    }
  }

  componentWillUnmount(): void {
    const { onSetItems } = this.props
    onSetItems([])
  }

  getItems(collection: Collection | null, collectionItems: Item[], itemCurations: ItemCuration[] | null) {
    const { selectedCollectionId, orphanItems, isReviewing } = this.props
    if (selectedCollectionId && collection) {
      return isThirdPartyCollection(collection) && isReviewing
        ? collectionItems.filter(
            item => !!itemCurations?.find(curation => curation.itemId === item.id && curation.status === CurationStatus.PENDING)
          )
        : collectionItems
    }
    return orphanItems
  }

  loadPage = (page: number) => {
    this.setState({ pages: [page] }, () => this.fetchResource())
  }

  getRandomPage = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  loadRandomPage = (currentItems: Item[]) => {
    const { pages } = this.state
    const { totalItems, totalCollections, onSetReviewedItems } = this.props
    const totalResources = this.isCollectionTabActive() ? totalCollections : totalItems
    const totalPages = Math.ceil(totalResources! / LEFT_PANEL_PAGE_SIZE)
    if (pages.length !== totalPages) {
      let randomPage: number | undefined
      while (randomPage !== undefined) {
        randomPage = this.getRandomPage(1, totalPages)
        if (pages.includes(randomPage)) {
          randomPage = undefined
        }
      }
      onSetReviewedItems(currentItems)
      if (randomPage !== undefined) {
        this.setState(prevState => ({ pages: [...prevState.pages, randomPage as number] }), this.fetchResource)
      }
    } else {
      onSetReviewedItems(currentItems)
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
      reviewedItems,
      isReviewing,
      isPlayingEmote,
      isConnected,
      wearableController,
      isLoading: isLoadingOrphanItems,
      hasUserOrphanItems,
      onSetItems,
      onSetReviewedItems,
      onResetReviewedItems
    } = this.props
    const { pages, showSamplesModalAgain } = this.state
    const showTabs = !selectedCollectionId && hasUserOrphanItems
    const showCollections = this.isCollectionTabActive() && !selectedCollectionId
    const showItems = !this.isCollectionTabActive() || selectedCollectionId
    return (
      <div className="LeftPanel">
        {isConnected ? (
          <CollectionProvider
            id={selectedCollectionId}
            itemSelected={selectedItemId}
            itemsPage={pages}
            itemsPageSize={LEFT_PANEL_PAGE_SIZE}
            fetchCollectionItemsOptions={{ status: isReviewing ? CurationStatus.PENDING : undefined }}
            onChangePage={page => this.setState({ pages: [page] })}
          >
            {({
              paginatedCollections,
              collection,
              paginatedItems: collectionItems,
              initialPage: collectionInitialPage,
              isLoadingCollection,
              isLoadingCollectionItems,
              itemCurations
            }) => {
              const items = this.getItems(collection, collectionItems, itemCurations)
              const isCollectionTab = this.isCollectionTabActive()
              const initialPage = selectedCollectionId && collection ? collectionInitialPage : this.state.initialPage

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
                      onLoadPage={this.loadPage}
                      isLoading={isLoadingCollection}
                    />
                  ) : null}
                  {showItems ? (
                    <>
                      <Items
                        items={items}
                        totalItems={totalItems || items.length}
                        hasHeader={!selectedCollectionId && collections.length > 0}
                        selectedItemId={selectedItemId}
                        collection={collection}
                        isReviewing={isReviewing}
                        isPlayingEmote={isPlayingEmote}
                        visibleItems={visibleItems}
                        bodyShape={bodyShape}
                        onResetReviewedItems={onResetReviewedItems}
                        reviewedItems={reviewedItems}
                        onSetItems={onSetItems}
                        wearableController={wearableController}
                        initialPage={initialPage}
                        isLoading={isLoadingCollectionItems || isLoadingOrphanItems}
                        onToggleShowSamplesModalAgain={this.handleToggleShowSamplesModalAgain}
                        showSamplesModalAgain={showSamplesModalAgain}
                        onReviewItems={() => this.loadRandomPage(items)}
                        onLoadPage={this.loadPage}
                        onSetReviewedItems={onSetReviewedItems}
                      />
                      <ItemAddedToast collectionId={selectedCollectionId} />
                    </>
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
