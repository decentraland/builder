import * as React from 'react'
import equal from 'fast-deep-equal'
import { DEFAULT_ITEMS_PAGE_SIZE, DEFAULT_ITEMS_PAGE, Props } from './CollectionProvider.types'

export default class CollectionProvider extends React.PureComponent<Props> {
  fetchCollectionItems(itemsPage: number | number[] = DEFAULT_ITEMS_PAGE) {
    const { id, onFetchCollectionItems, itemsPageSize } = this.props
    if (id) {
      onFetchCollectionItems(id, { page: itemsPage, limit: itemsPageSize || DEFAULT_ITEMS_PAGE_SIZE })
    }
  }

  componentDidMount() {
    const { id, onFetchCollection, isConnected, itemsPage } = this.props
    if (id && isConnected) {
      onFetchCollection(id)
      this.fetchCollectionItems(itemsPage)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { id, isConnected, collection, itemsPage, onFetchCollection } = this.props
    const justFinishedConnecting = !prevProps.isConnected && isConnected
    if (id && justFinishedConnecting) {
      onFetchCollection(id)
      this.fetchCollectionItems(itemsPage)
    }

    if (id && id !== prevProps.id && !collection) {
      onFetchCollection(id)
    }

    // logic to fetch the new pages requested
    const hasChangedPage = !equal(itemsPage, prevProps.itemsPage)
    if (id && itemsPage && hasChangedPage) {
      const prevPages = prevProps.itemsPage
      this.fetchCollectionItems(
        Array.isArray(itemsPage) && Array.isArray(prevPages) ? itemsPage.filter(page => !prevPages?.includes(page)) : itemsPage
      )
    }
  }

  render() {
    const { collection, items, paginatedItems, curation, itemCurations, isLoading, children, onFetchCollectionItems } = this.props
    return (
      <>
        {children({
          collection,
          items,
          paginatedItems,
          curation,
          itemCurations,
          isLoading,
          onFetchCollectionItemsPages: onFetchCollectionItems
        })}
      </>
    )
  }
}
