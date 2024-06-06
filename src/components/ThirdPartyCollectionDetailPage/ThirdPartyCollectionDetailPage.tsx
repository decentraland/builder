import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import {
  Grid,
  Section,
  Row,
  Narrow,
  Column,
  Header,
  Icon,
  Button,
  TextFilter,
  Pagination,
  PaginationProps,
  Checkbox,
  CheckboxProps,
  Loader,
  Dropdown,
  DropdownProps,
  Popup
} from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getArrayOfPagesFromTotal } from 'lib/api/pagination'
import { locations } from 'routing/locations'
import { isUserManagerOfThirdParty } from 'modules/thirdParty/utils'
import { Item } from 'modules/item/types'
import { fetchCollectionItemsRequest } from 'modules/item/actions'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import CollectionProvider from 'components/CollectionProvider'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import CollectionContextMenu from './CollectionContextMenu'
import CollectionPublishButton from './CollectionPublishButton'
import CollectionItem from './CollectionItem'
import { Props, PAGE_SIZE } from './ThirdPartyCollectionDetailPage.types'
import { ThirdParty } from 'modules/thirdParty/types'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'

import './ThirdPartyCollectionDetailPage.css'
import { useHistory } from 'react-router'

const STORAGE_KEY = 'dcl-third-party-collection-notice'

export default function ThirdPartyCollectionDetailPage({
  currentPage,
  wallet,
  thirdParty,
  items,
  collection,
  totalItems,
  isLoading,
  onOpenModal,
  onFetchAvailableSlots,
  onPageChange,
  isLoadingAvailableSlots
}: Props) {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(currentPage)
  const [showSelectAllPages, setShowSelectAllPages] = useState(false)
  const [shouldFetchAllPages, setShouldFetchAllPages] = useState(false)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const history = useHistory()

  useEffect(() => {
    if (thirdParty && thirdParty.availableSlots === undefined && !isLoadingAvailableSlots) {
      onFetchAvailableSlots(thirdParty.id)
    }
  }, [])

  useEffect(() => {
    if (thirdParty && thirdParty.availableSlots === undefined && !isLoadingAvailableSlots) {
      onFetchAvailableSlots(thirdParty.id)
    }
    // update the state if the page query param changes
    if (currentPage !== page) {
      setPage(currentPage)
    }

    if (shouldFetchAllPages) {
      // select all items in the state
      const selectedItems = items.reduce((acc, item) => {
        acc[item.id] = true
        return acc
      }, {} as Record<string, boolean>)
      setSelectedItems(selectedItems)
      setShowSelectAllPages(false)
    }
  }, [page, shouldFetchAllPages, items, thirdParty, isLoadingAvailableSlots, onFetchAvailableSlots, currentPage])

  const handleNewItems = useCallback(() => {
    onOpenModal('CreateItemsModal', { collectionId: collection!.id })
  }, [collection, onOpenModal])

  const handleEditName = useCallback(() => {
    if (collection) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }, [collection, onOpenModal])

  const handleGoBack = useCallback(() => {
    history.push(locations.collections())
  }, [history])

  const handlePageChange = useCallback(
    (_event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
      setPage(+data.activePage!)
      onPageChange(collection!.id, +data.activePage!)
    },
    [collection, onPageChange]
  )

  const handleSearchChange = useCallback((searchText: string) => {
    if (searchText) {
      setPage(1)
      setSearchText(searchText)
    }
  }, [])

  const handleSelectItemChange = useCallback(
    (item: Item, isSelected: boolean) => {
      setSelectedItems({
        ...selectedItems,
        [item.id]: isSelected
      })
      setShouldFetchAllPages(false)
      setShowSelectAllPages(false)
    },
    [selectedItems]
  )

  const areAllSelected = useCallback(
    (items: Item[]) => {
      return items.every(item => selectedItems[item.id])
    },
    [selectedItems]
  )

  const handleSelectPageChange = useCallback(
    (items: Item[], data: CheckboxProps) => {
      const newItemSelectionState: Record<string, boolean> = { ...selectedItems }
      const isSelected = !areAllSelected(items)

      for (const item of items) {
        newItemSelectionState[item.id] = isSelected
      }

      setSelectedItems(newItemSelectionState)
      setShowSelectAllPages(true)
      setShouldFetchAllPages(shouldFetchAllPages && !!data.checked)
    },
    [selectedItems, shouldFetchAllPages, areAllSelected]
  )

  const handleClearSelection = useCallback(() => {
    setSelectedItems({})
  }, [])

  const hasAccess = useMemo(() => {
    return collection && thirdParty && isUserManagerOfThirdParty(wallet.address, thirdParty)
  }, [collection, thirdParty, wallet.address])

  const handleSelectAllItems = useCallback(
    (onFetchAllCollectionItems: typeof fetchCollectionItemsRequest) => {
      setShouldFetchAllPages(true)
      if (collection) {
        const totalPages = Math.ceil(totalItems! / PAGE_SIZE)
        onFetchAllCollectionItems(collection.id, {
          page: getArrayOfPagesFromTotal(totalPages),
          limit: PAGE_SIZE,
          overridePaginationData: false
        })
      }
    },
    [totalItems]
  )

  const renderPage = useCallback(
    (thirdParty: ThirdParty, allItems: Item[], paginatedItems: Item[], onFetchCollectionItemsPages: typeof fetchCollectionItemsRequest) => {
      const areSlotsEmpty = thirdParty?.availableSlots && thirdParty.availableSlots <= 0
      const allSelectedItems = allItems.filter(item => selectedItems[item.id])
      const selectedItemsCount = allSelectedItems.length
      const total = totalItems!
      const totalPages = Math.ceil(total / PAGE_SIZE)

      if (!collection) {
        console.error('No collection defined')
        return null
      }

      return (
        <>
          <Section>
            <Row>
              <Back absolute onClick={handleGoBack} />
              <Narrow>
                <Row>
                  <Column className="header-column">
                    <Row className="header-row" onClick={handleEditName}>
                      <Header size="huge" className="name">
                        {collection.name}
                      </Header>
                      <BuilderIcon name="edit" className="edit-collection-name" />
                    </Row>
                    <Row className="urn-container">
                      <small className="urn">
                        <CopyToClipboard role="button" text={collection.urn}>
                          <Row>
                            <Popup
                              content={collection.urn}
                              position="bottom center"
                              trigger={<span className="urn-text">{collection.urn}</span>}
                              on="hover"
                            />
                            <Icon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
                          </Row>
                        </CopyToClipboard>
                      </small>
                    </Row>
                  </Column>
                  <Column align="right" shrink={false}>
                    <Row className="actions">
                      <div className={classNames('slots', { empty: areSlotsEmpty && !isLoadingAvailableSlots })}>
                        {isLoadingAvailableSlots ? (
                          <Loader active size="tiny" />
                        ) : (
                          <>
                            {t('third_party_collection_detail_page.slots', { amount: thirdParty?.availableSlots })}
                            {areSlotsEmpty ? <span className="buy-slots link">{t('global.buy')}</span> : null}
                          </>
                        )}
                      </div>
                      <Button secondary compact className={'add-items'} onClick={handleNewItems}>
                        {t('third_party_collection_detail_page.new_items')}
                      </Button>
                      {thirdParty.availableSlots !== undefined ? (
                        <CollectionPublishButton collection={collection} items={allSelectedItems} slots={thirdParty.availableSlots} />
                      ) : null}
                      <CollectionContextMenu collection={collection} items={paginatedItems} />
                    </Row>
                  </Column>
                </Row>
              </Narrow>
            </Row>
          </Section>
          <Narrow>
            <Notice storageKey={STORAGE_KEY}>
              <T id="third_party_collection_detail_page.notice" />
            </Notice>

            {paginatedItems.length ? (
              <>
                <div className="search-container">
                  <TextFilter
                    placeholder={t('third_party_collection_detail_page.search_placeholder', { count: total })}
                    value={searchText}
                    onChange={handleSearchChange}
                  />

                  <div className="search-info secondary-text">
                    {t('third_party_collection_detail_page.search_info', {
                      page: (page - 1) * PAGE_SIZE + 1,
                      pageTotal: Math.min(total, page * PAGE_SIZE),
                      total
                    })}
                  </div>
                  <Dropdown
                    className="synced-status-list"
                    direction="left"
                    value={filters.synced}
                    placeholder={t('third_party_collection_detail_page.synced_filter.all')}
                    defaultSelectedLabel={t('third_party_collection_detail_page.synced_filter.all')}
                    defaultValue={filters.synced}
                    options={[
                      { value: undefined || '', text: t('third_party_collection_detail_page.synced_filter.all') },
                      { value: true, text: t('third_party_collection_detail_page.synced_filter.synced') },
                      { value: false, text: t('third_party_collection_detail_page.synced_filter.unsynced') }
                    ]}
                    onChange={(_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
                      setFilters({ synced: value as boolean })
                    }}
                  />
                </div>

                {selectedItemsCount > 0 ? (
                  <div className="selection-info">
                    {t('third_party_collection_detail_page.selection', { count: selectedItemsCount })}
                    &nbsp;
                    <span className="link" onClick={handleClearSelection}>
                      {t('third_party_collection_detail_page.clear_selection')}
                    </span>
                    . &nbsp;
                    {showSelectAllPages && totalPages > 1 ? (
                      <span className="link" onClick={() => handleSelectAllItems(onFetchCollectionItemsPages)}>
                        {t('third_party_collection_detail_page.select_all', { total })}
                      </span>
                    ) : null}
                    &nbsp;
                  </div>
                ) : null}

                <div className="collection-items">
                  <Grid columns="equal" className="grid-header secondary-text">
                    <Grid.Row>
                      <Grid.Column width={5} className="item-column">
                        <Checkbox
                          className="item-checkbox"
                          checked={areAllSelected(paginatedItems)}
                          onClick={(_event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) =>
                            handleSelectPageChange(paginatedItems, data)
                          }
                        />
                        &nbsp;
                        {t('global.item')}
                      </Grid.Column>
                      <Grid.Column>{t('global.category')}</Grid.Column>
                      <Grid.Column>{t('global.body_shape')}</Grid.Column>
                      <Grid.Column>URN ID</Grid.Column>
                      <Grid.Column width={3}> {t('collection_row.status')} </Grid.Column>
                      <Grid.Column width={1}></Grid.Column>
                    </Grid.Row>
                  </Grid>

                  {paginatedItems.map(item => (
                    <CollectionItem
                      key={item.id}
                      collection={collection}
                      item={item}
                      selected={!!selectedItems[item.id]}
                      onSelect={handleSelectItemChange}
                    />
                  ))}

                  {totalPages > 1 ? (
                    <Pagination
                      firstItem={null}
                      lastItem={null}
                      totalPages={totalPages}
                      activePage={page}
                      onPageChange={handlePageChange}
                    />
                  ) : null}
                </div>
              </>
            ) : (
              <div className="empty">
                <div className="sparkles" />
                <div>
                  {t('third_party_collection_detail_page.start_adding_items')}
                  <br />
                  {t('third_party_collection_detail_page.cant_remove')}
                </div>
              </div>
            )}
          </Narrow>
        </>
      )
    },
    []
  )

  const shouldRender = hasAccess && collection
  return (
    <CollectionProvider id={collection?.id} itemsPage={page} itemsPageSize={PAGE_SIZE} fetchOptions={filters}>
      {({ isLoading: isLoadingCollectionData, items, paginatedItems, onFetchCollectionItemsPages }) => (
        <LoggedInDetailPage
          className="ThirdPartyCollectionDetailPage"
          hasNavigation={!hasAccess && !isLoading}
          isLoading={isLoading || isLoadingCollectionData}
        >
          {shouldRender && thirdParty ? renderPage(thirdParty, items, paginatedItems, onFetchCollectionItemsPages) : <NotFound />}
        </LoggedInDetailPage>
      )}
    </CollectionProvider>
  )
}
