import { useCallback, useEffect, useRef, useState } from 'react'
import { Item, ItemType } from 'modules/item/types'
import { INITIAL_PAGE, LEFT_PANEL_PAGE_SIZE } from '../constants'
import { ItemEditorTabs, UseLeftPanelPaginationOptions, UseItemSelectionOptions, UseInitialDataFetchOptions } from './LeftPanel.types'

/**
 * Manages pagination state and logic for the LeftPanel component.
 *
 * Handles:
 * - Current page tracking
 * - Finding newly created items by iterating through pages
 * - Loading random pages for reviewing items
 * - Resetting pagination when collection/tab changes
 */
export const useLeftPanelPagination = (options: UseLeftPanelPaginationOptions) => {
  const {
    address,
    selectedCollectionId,
    selectedItemId,
    orphanItems,
    totalItems,
    totalCollections,
    isConnected,
    currentTab,
    onFetchResource,
    onSetReviewedItems
  } = options

  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE)
  const [visitedPages, setVisitedPages] = useState<number[]>([INITIAL_PAGE])

  // Track previous values to detect changes
  const prevSelectedCollectionId = useRef(selectedCollectionId)
  const prevIsConnected = useRef(isConnected)
  const prevCurrentTab = useRef(currentTab)

  const isCollectionTabActive = currentTab === ItemEditorTabs.COLLECTIONS && !selectedCollectionId

  // Reset pagination when collection or tab changes
  useEffect(() => {
    const collectionChanged = prevSelectedCollectionId.current !== selectedCollectionId
    const connectionChanged = isConnected && !prevIsConnected.current
    const tabChanged = prevCurrentTab.current !== currentTab

    if (collectionChanged || connectionChanged || tabChanged) {
      setCurrentPage(INITIAL_PAGE)
      setVisitedPages([INITIAL_PAGE])
    }

    prevSelectedCollectionId.current = selectedCollectionId
    prevIsConnected.current = isConnected
    prevCurrentTab.current = currentTab
  }, [selectedCollectionId, isConnected, currentTab])

  /**
   * When a newly created item redirects to the item editor, iterate over the pages
   * until finding it. This handles the case where the new item might be on a different page.
   */
  useEffect(() => {
    if (selectedCollectionId || !address || !selectedItemId || !totalItems) {
      return
    }

    const itemExists = orphanItems.some(item => item.id === selectedItemId)
    if (itemExists) {
      return
    }

    const totalPages = Math.ceil(totalItems / LEFT_PANEL_PAGE_SIZE)
    const nextPage = Math.min(totalPages, currentPage + 1)

    if (!visitedPages.includes(nextPage) && nextPage !== currentPage) {
      setCurrentPage(nextPage)
      setVisitedPages(prev => [...prev, nextPage])
      onFetchResource(nextPage)
    }
  }, [address, selectedCollectionId, selectedItemId, orphanItems, totalItems, currentPage, visitedPages, onFetchResource])

  /**
   * Load a specific page
   */
  const loadPage = useCallback(
    (page: number) => {
      setCurrentPage(page)
      setVisitedPages([page])
      onFetchResource(page)
    },
    [onFetchResource]
  )

  /**
   * Load a random page for reviewing items.
   * Used during third-party item reviews to get a random sample of items.
   */
  const loadRandomPage = useCallback(
    (currentItems: Item[]) => {
      const totalResources = isCollectionTabActive ? totalCollections : totalItems
      if (!totalResources) {
        onSetReviewedItems(currentItems)
        return
      }

      const totalPages = Math.ceil(totalResources / LEFT_PANEL_PAGE_SIZE)

      if (totalPages > visitedPages.length) {
        const availablePages = [...Array(totalPages).keys()].map(i => i + 1).filter(page => !visitedPages.includes(page))

        if (availablePages.length > 0) {
          const randomPage = availablePages[Math.floor(Math.random() * availablePages.length)]
          setCurrentPage(randomPage)
          setVisitedPages(prev => [...prev, randomPage])
          onFetchResource(randomPage)
        }
      }

      onSetReviewedItems(currentItems)
    },
    [isCollectionTabActive, totalCollections, totalItems, visitedPages, onFetchResource, onSetReviewedItems]
  )

  /**
   * Handle page change from CollectionProvider
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    setVisitedPages([page])
  }, [])

  return {
    currentPage,
    visitedPages,
    loadPage,
    loadRandomPage,
    handlePageChange,
    isCollectionTabActive
  }
}

/**
 * Manages item selection and visibility for the LeftPanel component.
 *
 * Handles:
 * - Preselecting items when clicking on a collection
 * - Clearing visible items when changing collections
 * - Managing emote visibility for auto-play functionality
 *
 * EMOTE HANDLING:
 * - Emotes are added to visibleItems to trigger auto-play in the preview
 * - Only one emote can be visible at a time (others are filtered out)
 * - The Items component (Items.tsx:74-86) handles the play/pause toggle
 *   via wearableController when clicking on an already-visible emote
 * - When switching to a non-emote item, emotes are filtered from visibleItems
 */
export const useItemSelection = (options: UseItemSelectionOptions) => {
  const { selectedItem, selectedItemId, selectedCollectionId, visibleItems, onSetItems, onResetEmoteToIdle } = options

  // Track previous values to detect changes
  const prevSelectedItem = useRef(selectedItem)
  const prevSelectedItemId = useRef(selectedItemId)
  const prevSelectedCollectionId = useRef(selectedCollectionId)
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Skip initial mount - let componentDidMount equivalent handle it
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevSelectedItem.current = selectedItem
      prevSelectedItemId.current = selectedItemId
      prevSelectedCollectionId.current = selectedCollectionId
      return
    }

    const collectionChanged = prevSelectedCollectionId.current !== selectedCollectionId

    // Clear visible items and reset emote to idle when changing collection
    if (collectionChanged) {
      onSetItems([])
      onResetEmoteToIdle()
      prevSelectedCollectionId.current = selectedCollectionId
      prevSelectedItem.current = selectedItem
      prevSelectedItemId.current = selectedItemId
      return
    }

    // Preselect item when clicking on a collection (new item appears)
    // This includes emotes - adding them to visibleItems triggers auto-play
    if (!prevSelectedItem.current && selectedItem) {
      // For emotes, filter out any existing emotes first (only one can play at a time)
      if (selectedItem.type === ItemType.EMOTE) {
        const nonEmoteItems = visibleItems.filter(item => item.type !== ItemType.EMOTE)
        onSetItems([...nonEmoteItems, selectedItem])
      } else {
        onSetItems([selectedItem])
      }
    }

    // When switching between items (both previous and current exist and are different)
    const itemIdChanged = prevSelectedItemId.current && selectedItemId && prevSelectedItemId.current !== selectedItemId
    if (itemIdChanged && selectedItem) {
      if (selectedItem.type === ItemType.EMOTE) {
        // Switching to an emote: filter out other emotes and add the new one
        const nonEmoteItems = visibleItems.filter(item => item.type !== ItemType.EMOTE)
        onSetItems([...nonEmoteItems, selectedItem])
      } else {
        // Switching to a non-emote item: filter out emotes from visible items
        const nonEmoteItems = visibleItems.filter(item => item.type !== ItemType.EMOTE)
        onSetItems(nonEmoteItems)
      }
    }

    prevSelectedItem.current = selectedItem
    prevSelectedItemId.current = selectedItemId
    prevSelectedCollectionId.current = selectedCollectionId
  }, [selectedItem, selectedItemId, selectedCollectionId, visibleItems, onSetItems])
}

/**
 * Handles initial data fetching when the component mounts.
 * Also handles fetching orphan items when the address changes.
 */
export const useInitialDataFetch = (options: UseInitialDataFetchOptions) => {
  const {
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
  } = options

  const hasInitializedRef = useRef(false)
  const prevAddressRef = useRef(address)

  // Initial mount logic
  useEffect(() => {
    if (hasInitializedRef.current) {
      return
    }
    hasInitializedRef.current = true

    // Fetch initial resources
    if (address && !isReviewing && !selectedCollectionId) {
      const isCollectionTab = currentTab === ItemEditorTabs.COLLECTIONS && !selectedCollectionId
      const fetchFn = isCollectionTab ? onFetchCollections : onFetchOrphanItems
      fetchFn(address, { limit: LEFT_PANEL_PAGE_SIZE, page: INITIAL_PAGE })
    }

    // TODO: Remove this call when there are no users with orphan items
    if (address && hasUserOrphanItems === undefined) {
      onFetchOrphanItem(address)
    }

    // Set initial selected item
    if (selectedItem) {
      onSetItems([selectedItem])
    }
  }, []) // Empty deps - only run on mount

  // Handle address changes for orphan items
  useEffect(() => {
    if (address && address !== prevAddressRef.current && hasUserOrphanItems === undefined) {
      onFetchOrphanItem(address)
    }
    prevAddressRef.current = address
  }, [address, hasUserOrphanItems, onFetchOrphanItem])
}

/**
 * Cleanup hook that clears visible items when component unmounts.
 */
export const useCleanup = (onSetItems: (items: Item[]) => void) => {
  const onSetItemsRef = useRef(onSetItems)
  onSetItemsRef.current = onSetItems

  useEffect(() => {
    return () => {
      onSetItemsRef.current([])
    }
  }, [])
}
