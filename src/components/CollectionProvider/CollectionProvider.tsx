import * as React from 'react'
import equal from 'fast-deep-equal'
import { DEFAULT_ITEMS_PAGE_SIZE, DEFAULT_ITEMS_PAGE, Props } from './CollectionProvider.types'

export default class CollectionProvider extends React.PureComponent<Props> {
  state = {
    initialPage: DEFAULT_ITEMS_PAGE
  }

  fetchCollectionItems(itemsPage: number | number[] = DEFAULT_ITEMS_PAGE) {
    const { id, onFetchCollectionItems, itemsPageSize, fetchOptions } = this.props
    if (id) {
      onFetchCollectionItems(id, { page: itemsPage, limit: itemsPageSize || DEFAULT_ITEMS_PAGE_SIZE, ...fetchOptions })
    }
  }

  componentDidMount() {
    const { id, onFetchCollection, isConnected, itemsPage } = this.props
    if (id && isConnected) {
      onFetchCollection(id)
      this.fetchCollectionItems(itemsPage)
    }
  }

  componentDidUpdate(prevProps: Props, prevState: any) {
    const {
      id,
      isConnected,
      collection,
      items,
      itemsPage,
      itemsPageSize,
      itemSelected,
      fetchOptions,
      paginatedItems,
      onFetchCollection,
      onChangePage
    } = this.props
    const justFinishedConnecting = !prevProps.isConnected && isConnected
    if (id && justFinishedConnecting) {
      onFetchCollection(id)
      this.fetchCollectionItems(itemsPage)
    }

    if (
      collection &&
      paginatedItems.length &&
      itemSelected &&
      Array.isArray(itemsPage) &&
      (this.state.initialPage === DEFAULT_ITEMS_PAGE || prevState.initialPage < this.state.initialPage)
    ) {
      if (!paginatedItems.find(item => item.id === itemSelected)) {
        const page = itemsPage[itemsPage.length - 1]
        const totalPages = Math.ceil(items.length / itemsPageSize!)
        const nextPage = Math.min(totalPages, page + 1)
        if (!itemsPage.includes(nextPage)) {
          this.setState({ initialPage: nextPage }, () => onChangePage!(nextPage))
        }
      }
    }

    if (id && id !== prevProps.id) {
      // fetch collection if data is not available
      if (!collection) {
        onFetchCollection(id)
      }
      // fetch collection items if the id changes
      this.fetchCollectionItems(DEFAULT_ITEMS_PAGE)
    }

    // logic to fetch the new pages requested
    const hasChangedPage = !equal(itemsPage, prevProps.itemsPage)
    const hasChangeFilter = !equal(fetchOptions, prevProps.fetchOptions)
    if (id && ((itemsPage && hasChangedPage) || hasChangeFilter)) {
      const prevPages = prevProps.itemsPage
      this.fetchCollectionItems(
        Array.isArray(itemsPage) && Array.isArray(prevPages) ? itemsPage.filter(page => !prevPages?.includes(page)) : itemsPage
      )
    }
  }

  render() {
    const {
      collection,
      paginatedCollections,
      items,
      paginatedItems,
      curation,
      itemCurations,
      isLoading,
      children,
      onFetchCollectionItems
    } = this.props
    const { initialPage } = this.state
    return (
      <>
        {children({
          collection,
          items,
          paginatedItems,
          initialPage,
          paginatedCollections,
          curation,
          itemCurations,
          isLoading,
          onFetchCollectionItemsPages: onFetchCollectionItems
        })}
      </>
    )
  }
}
