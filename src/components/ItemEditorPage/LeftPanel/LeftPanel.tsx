import React, { memo, useState, useCallback, useMemo } from 'react'
import { Tabs } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import { CurationStatus } from 'modules/curations/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { isThirdPartyCollection } from 'modules/collection/utils'
import { Item } from 'modules/item/types'
import CollectionProvider from 'components/CollectionProvider'
import { ItemAddedToast } from './Toasts/ItemAdded'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import { INITIAL_PAGE, LEFT_PANEL_PAGE_SIZE } from '../constants'
import { Props, ItemEditorTabs } from './LeftPanel.types'
import { useLeftPanelPagination, useItemSelection, useInitialDataFetch, useCleanup } from './LeftPanel.hooks'
import './LeftPanel.css'

function getInitialTab(selectedCollectionId: string | null, selectedItemId: string | null): ItemEditorTabs {
  if (!selectedCollectionId && selectedItemId) {
    return ItemEditorTabs.ORPHAN_ITEMS
  }
  return ItemEditorTabs.COLLECTIONS
}

function getDisplayItems(
  selectedCollectionId: string | null,
  collection: Collection | null,
  collectionItems: Item[],
  itemCurations: ItemCuration[] | null,
  orphanItems: Item[],
  isReviewing: boolean
): Item[] {
  if (selectedCollectionId && collection) {
    if (isThirdPartyCollection(collection) && isReviewing) {
      return collectionItems.filter(
        item => !!itemCurations?.find(curation => curation.itemId === item.id && curation.status === CurationStatus.PENDING)
      )
    }
    return collectionItems
  }
  return orphanItems
}

function checkIsCollectionTabActive(currentTab: ItemEditorTabs, selectedCollectionId: string | null): boolean {
  return currentTab === ItemEditorTabs.COLLECTIONS && !selectedCollectionId
}

/**
 * LeftPanel is the main navigation component for the Item Editor.
 * It displays collections and items in a sidebar format with tab navigation.
 *
 * Features:
 * - Tab navigation between Collections and Orphan Items
 * - Pagination for both collections and items
 * - Random page sampling for third-party item reviews
 * - Item selection and visibility management
 *
 * EMOTE HANDLING:
 * Emotes are handled differently than wearables in this component:
 * 1. When switching between non-emote items, emotes are filtered from visibleItems
 * 2. This is because emotes have their own playback control via wearableController
 * 3. The Items component (Items.tsx) manages emote selection and play/pause state
 * 4. Only one emote can be active at a time
 */
const LeftPanel: React.FC<Props> = props => {
  const {
    address,
    isConnected,
    items: allItems,
    totalItems,
    totalCollections,
    orphanItems,
    collections,
    selectedItemId,
    selectedItem,
    selectedCollectionId,
    visibleItems,
    reviewedItems,
    isReviewing,
    isPlayingEmote,
    bodyShape,
    wearableController,
    isLoading: isLoadingOrphanItems,
    hasUserOrphanItems,
    onSetItems,
    onFetchOrphanItems,
    onFetchCollections,
    onSetReviewedItems,
    onFetchOrphanItem,
    onResetReviewedItems,
    onResetEmoteToIdle
  } = props

  const [currentTab, setCurrentTab] = useState<ItemEditorTabs>(() => getInitialTab(selectedCollectionId, selectedItemId))

  const [showSamplesModalAgain, setShowSamplesModalAgain] = useState(true)

  const isCollectionTabActive = useMemo(
    () => checkIsCollectionTabActive(currentTab, selectedCollectionId),
    [currentTab, selectedCollectionId]
  )

  const showTabs = !selectedCollectionId && hasUserOrphanItems
  const showCollections = isCollectionTabActive && !selectedCollectionId
  const showItems = !isCollectionTabActive || selectedCollectionId

  /**
   * Fetches the appropriate resource (collections or items) based on current state.
   * This is for the items editor base view - when a collection is selected,
   * the CollectionProvider handles the fetching logic.
   */
  const fetchResource = useCallback(
    (page: number) => {
      if (!address || isReviewing || selectedCollectionId) {
        return
      }

      const fetchFn = isCollectionTabActive ? onFetchCollections : onFetchOrphanItems
      fetchFn(address, { limit: LEFT_PANEL_PAGE_SIZE, page })
    },
    [address, isReviewing, selectedCollectionId, isCollectionTabActive, onFetchCollections, onFetchOrphanItems]
  )

  const { currentPage, loadPage, loadRandomPage, handlePageChange } = useLeftPanelPagination({
    address,
    selectedCollectionId,
    selectedItemId,
    orphanItems,
    totalItems,
    totalCollections,
    isConnected,
    currentTab,
    onFetchResource: fetchResource,
    onSetReviewedItems
  })

  // Handle item selection and visibility
  useItemSelection({
    selectedItem,
    selectedItemId,
    selectedCollectionId,
    visibleItems,
    onSetItems,
    onResetEmoteToIdle
  })

  // Handle initial data fetching
  useInitialDataFetch({
    address,
    hasUserOrphanItems,
    selectedItem,
    isReviewing,
    selectedCollectionId,
    currentTab,
    onFetchOrphanItem,
    onFetchCollections,
    onFetchOrphanItems,
    onSetItems
  })

  // Cleanup on unmount
  useCleanup(onSetItems)

  const handleToggleShowSamplesModalAgain = useCallback(() => {
    setShowSamplesModalAgain(prev => !prev)
  }, [])

  const handleTabChange = useCallback(
    (tab: ItemEditorTabs) => {
      setCurrentTab(tab)
      fetchResource(INITIAL_PAGE)
    },
    [fetchResource]
  )

  const handleLoadRandomPage = useCallback(
    (items: Item[]) => {
      loadRandomPage(items)
    },
    [loadRandomPage]
  )

  if (!isConnected) {
    return <div className="LeftPanel" />
  }

  return (
    <div className="LeftPanel">
      <CollectionProvider
        id={selectedCollectionId}
        itemSelected={selectedItemId}
        itemsPage={[currentPage]}
        itemsPageSize={LEFT_PANEL_PAGE_SIZE}
        fetchCollectionItemsOptions={{ status: isReviewing ? CurationStatus.PENDING : undefined }}
        onChangePage={handlePageChange}
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
          const items = getDisplayItems(selectedCollectionId, collection, collectionItems, itemCurations, orphanItems, isReviewing)

          const displayInitialPage = selectedCollectionId && collection ? collectionInitialPage : currentPage

          return (
            <>
              <Header />
              {showTabs && (
                <Tabs isFullscreen>
                  <Tabs.Tab active={isCollectionTabActive} onClick={() => handleTabChange(ItemEditorTabs.COLLECTIONS)}>
                    {t('collections_page.collections')}
                  </Tabs.Tab>
                  <Tabs.Tab active={!isCollectionTabActive} onClick={() => handleTabChange(ItemEditorTabs.ORPHAN_ITEMS)}>
                    {t('item_editor.left_panel.items')}
                  </Tabs.Tab>
                </Tabs>
              )}
              {showCollections && (
                <Collections
                  collections={paginatedCollections}
                  totalCollections={totalCollections || collections.length}
                  items={allItems}
                  hasHeader={items.length > 0}
                  selectedCollectionId={selectedCollectionId}
                  onLoadPage={loadPage}
                  isLoading={isLoadingCollection}
                />
              )}
              {showItems && (
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
                    initialPage={displayInitialPage}
                    isLoading={isLoadingCollectionItems || isLoadingOrphanItems}
                    onToggleShowSamplesModalAgain={handleToggleShowSamplesModalAgain}
                    showSamplesModalAgain={showSamplesModalAgain}
                    onReviewItems={() => onSetReviewedItems(items)}
                    onLoadRandomPage={() => handleLoadRandomPage(items)}
                    onLoadPage={loadPage}
                  />
                  <ItemAddedToast collectionId={selectedCollectionId} />
                </>
              )}
            </>
          )
        }}
      </CollectionProvider>
    </div>
  )
}

export default memo(LeftPanel)
