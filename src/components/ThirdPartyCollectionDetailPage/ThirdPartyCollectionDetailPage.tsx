import { useHistory } from 'react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Header,
  Icon,
  Button,
  Pagination,
  PaginationProps,
  CheckboxProps,
  Loader,
  Dropdown,
  DropdownProps,
  InfoTooltip
} from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getArrayOfPagesFromTotal } from 'lib/api/pagination'
import { locations } from 'routing/locations'
import { ItemMappingStatus } from 'lib/api/builder'
import { extractThirdPartyId } from 'lib/urn'
import { isUserManagerOfThirdParty } from 'modules/thirdParty/utils'
import { Item } from 'modules/item/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { CollectionType } from 'modules/collection/types'
import { fetchCollectionItemsRequest } from 'modules/item/actions'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import CollectionProvider from 'components/CollectionProvider'
import NotFound from 'components/NotFound'
import { ThirdPartyImage } from 'components/ThirdPartyImage'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import { shorten } from 'lib/address'
import { CopyToClipboard } from 'components/CopyToClipboard'
import { CollectionTypeBadge } from 'components/Badges/CollectionTypeBadge'
import { ThirdPartyKindBadge } from 'components/Badges/ThirdPartyKindBadge'
import CollectionContextMenu from './CollectionContextMenu'
import CollectionPublishButton from './CollectionPublishButton'
import CollectionItem from './CollectionItem'
import { CollectionItemV2 } from './CollectionItemV2'
import { Props, PAGE_SIZE } from './ThirdPartyCollectionDetailPage.types'
import { CollectionItemHeader } from './CollectionItemHeader'
import { CollectionItemHeaderV2 } from './CollectionItemHeaderV2'
import styles from './ThirdPartyCollectionDetailPage.module.css'

const Info = ({ children, title, info }: { children: React.ReactNode; title: string; info?: string }) => (
  <div className={styles.info}>
    <div className={styles.infoHeader}>
      {title} {info && <InfoTooltip content={info} />}
    </div>
    <div className={styles.infoContent}>{children}</div>
  </div>
)

enum ItemStatus {
  ALL = 'ALL',
  SYNCED = 'SYNCED',
  UNSYNCED = 'UNSYNCED',
  MIGRATION_REQUIRED = 'MIGRATION_REQUIRED',
  MAPPING_PENDING = 'MAPPING_PENDING'
}

export default function ThirdPartyCollectionDetailPage({
  currentPage,
  lastLocation,
  wallet,
  thirdParty,
  items,
  collection,
  totalItems,
  isLoading,
  isThirdPartyV2Enabled,
  isLinkedWearablesPaymentsEnabled,
  onFetchAvailableSlots,
  onFetchThirdParty,
  onNewItem,
  onEditName,
  isLoadingAvailableSlots
}: Props) {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [page, setPage] = useState(currentPage)
  const [showSelectAllPages, setShowSelectAllPages] = useState(false)
  const [shouldFetchAllPages, setShouldFetchAllPages] = useState(false)
  const [itemStatus, setItemStatus] = useState<ItemStatus>(ItemStatus.ALL)
  const history = useHistory()
  const isComingFromTheCollectionsPage = lastLocation === locations.collections()

  useEffect(() => {
    if (thirdParty && thirdParty.availableSlots === undefined && !isLoadingAvailableSlots) {
      onFetchAvailableSlots(thirdParty.id)
    }
  }, [thirdParty, isLoadingAvailableSlots, onFetchAvailableSlots])

  useEffect(() => {
    if (!isLoading && !thirdParty && collection?.urn) {
      onFetchThirdParty(extractThirdPartyId(collection.urn))
    }
  }, [collection?.urn, isLoading, thirdParty])

  useEffect(() => {
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
  }, [page, shouldFetchAllPages, items, thirdParty, currentPage])

  const handleNewItems = useCallback(() => {
    if (collection?.id) {
      onNewItem(collection.id)
    }
  }, [collection?.id, onNewItem])

  const handleEditName = useCallback(() => {
    if (collection) {
      onEditName(collection)
    }
  }, [collection, onEditName])

  const handleGoBack = useCallback(() => {
    if (isComingFromTheCollectionsPage) {
      history.goBack()
    } else {
      history.push(locations.collections(CollectionType.THIRD_PARTY))
    }
  }, [history, isComingFromTheCollectionsPage])

  const handlePageChange = useCallback(
    (_event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
      setPage(+data.activePage!)
      history.push(locations.thirdPartyCollectionDetail(collection!.id, { page: +data.activePage! }))
    },
    [collection, history]
  )

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
    return collection && thirdParty && wallet && isUserManagerOfThirdParty(wallet.address, thirdParty)
  }, [collection, thirdParty, wallet])

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

  const handleChangeStatus = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
      setItemStatus(value as ItemStatus)
    },
    [setItemStatus]
  )

  const itemStatusOptions = [
    { value: ItemStatus.ALL, text: t('third_party_collection_detail_page.synced_filter.all') },
    { value: ItemStatus.SYNCED, text: t('item_status.synced') },
    { value: ItemStatus.UNSYNCED, text: t('item_status.unsynced') },
    ...(!collection?.isMappingComplete
      ? [
          { value: ItemStatus.MIGRATION_REQUIRED, text: t('item_status.pending_migration') },
          { value: ItemStatus.MAPPING_PENDING, text: t('item_status.pending_mapping') }
        ]
      : [])
  ]

  const itemFilters = useMemo(() => {
    switch (itemStatus) {
      case ItemStatus.SYNCED:
        return { synced: true }
      case ItemStatus.UNSYNCED:
        return { synced: false }
      case ItemStatus.MIGRATION_REQUIRED:
        return { mappingStatus: ItemMappingStatus.UNPUBLISHED_MAPPING }
      case ItemStatus.MAPPING_PENDING:
        return { mappingStatus: ItemMappingStatus.MISSING_MAPPING }
      default:
        return {}
    }
  }, [itemStatus])

  const renderPage = useCallback(
    (
      thirdParty: ThirdParty,
      allItems: Item[],
      paginatedItems: Item[],
      isLoadingCollectionItems: boolean,
      onFetchCollectionItemsPages: typeof fetchCollectionItemsRequest
    ) => {
      const allSelectedItems = allItems.filter(item => selectedItems[item.id])
      const selectedItemsCount = allSelectedItems.length
      const isCollectionLinked = Boolean(collection?.linkedContractAddress && collection?.linkedContractNetwork)
      const total = totalItems!
      const totalPages = Math.ceil(total / PAGE_SIZE)
      const isCollectionEmpty = collection?.itemCount === 0

      if (!collection) {
        console.error('No collection defined')
        return null
      }

      return (
        <>
          <div className={styles.header}>
            <Back absolute onClick={handleGoBack} />
            <div className={styles.content}>
              <div className={styles.title}>
                <ThirdPartyImage collectionId={collection.id} />
                <div className={styles.nameAndType}>
                  <div className={styles.nameWrapper}>
                    <Header size="large" className={styles.name} onClick={handleEditName}>
                      {collection.name}
                    </Header>
                    {!collection.isPublished && <BuilderIcon name="edit" className={styles.editCollectionName} />}
                  </div>
                  <div className={styles.type}>
                    <CollectionTypeBadge isThirdParty />
                    <ThirdPartyKindBadge isProgrammatic={thirdParty.isProgrammatic} />
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                {collection.linkedContractAddress && collection.linkedContractNetwork && (
                  <Info
                    title={t('third_party_collection_detail_page.smart_contract_address_short')}
                    info={t('third_party_collection_detail_page.smart_contract_address_long')}
                  >
                    {shorten(collection.linkedContractAddress)}{' '}
                    <CopyToClipboard className={styles.copyButton} showPopup text={collection.linkedContractAddress} role="button">
                      <Icon name="copy outline" />
                    </CopyToClipboard>
                  </Info>
                )}
                {!isLinkedWearablesPaymentsEnabled && (
                  <Info
                    title={t('third_party_collection_detail_page.slots_short')}
                    info={t('third_party_collection_detail_page.slots_long')}
                  >
                    <div className={styles.slotsIcon} />
                    {isLoadingAvailableSlots ? (
                      <Loader active inline size="tiny" />
                    ) : (
                      <span>
                        {thirdParty.availableSlots ?? 0} / {thirdParty.maxItems}
                      </span>
                    )}
                  </Info>
                )}
                <Button inverted onClick={handleNewItems}>
                  <Icon name="plus" />
                  {t('third_party_collection_detail_page.new_items')}
                </Button>
                {thirdParty.availableSlots !== undefined ? (
                  <CollectionPublishButton collection={collection} items={allSelectedItems} slots={thirdParty.availableSlots} />
                ) : null}
                <CollectionContextMenu collection={collection} items={paginatedItems} />
              </div>
            </div>
          </div>
          {!collection.isMappingComplete && (
            <div className={styles.migrationBanner}>
              <Icon name="sync" /> {t('third_party_collection_detail_page.migration_banner')}
            </div>
          )}
          <div className={styles.body}>
            {isLoadingCollectionItems ? (
              <div className={styles.loader}>
                <Loader size="massive" inline active />
              </div>
            ) : (
              <>
                {(collection.itemCount ?? 0) > 0 && (
                  <div className={styles.searchContainer}>
                    {paginatedItems.length > 0 && (
                      <div className={styles.searchInfo}>
                        {t('third_party_collection_detail_page.search_info', {
                          page: (page - 1) * PAGE_SIZE + 1,
                          pageTotal: Math.min(total, page * PAGE_SIZE),
                          total
                        })}
                      </div>
                    )}
                    <Dropdown
                      className={styles.syncedStatusList}
                      direction="left"
                      value={itemStatus}
                      options={itemStatusOptions}
                      onChange={handleChangeStatus}
                    />
                  </div>
                )}
                {paginatedItems.length ? (
                  <>
                    {selectedItemsCount > 0 ? (
                      <div className={styles.selectionInfo}>
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

                    <div>
                      {isThirdPartyV2Enabled && isCollectionLinked ? (
                        <CollectionItemHeaderV2
                          areAllSelected={areAllSelected(paginatedItems)}
                          onSelectedAllClick={(_event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) =>
                            handleSelectPageChange(paginatedItems, data)
                          }
                        />
                      ) : (
                        <CollectionItemHeader
                          areAllSelected={areAllSelected(paginatedItems)}
                          onSelectedAllClick={(_event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) =>
                            handleSelectPageChange(paginatedItems, data)
                          }
                        />
                      )}

                      {paginatedItems.map(item =>
                        isThirdPartyV2Enabled && isCollectionLinked ? (
                          <CollectionItemV2
                            key={item.id}
                            collection={collection}
                            item={item}
                            selected={!!selectedItems[item.id]}
                            onSelect={handleSelectItemChange}
                          />
                        ) : (
                          <CollectionItem
                            key={item.id}
                            collection={collection}
                            item={item}
                            selected={!!selectedItems[item.id]}
                            onSelect={handleSelectItemChange}
                          />
                        )
                      )}

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
                  <div className={styles.empty}>
                    <div className={isCollectionEmpty ? styles.start : styles.sparkles} />
                    {isCollectionEmpty ? (
                      <>
                        <h3>{t('third_party_collection_detail_page.start_adding_items')}</h3>
                        <p>{t('third_party_collection_detail_page.cant_remove')}</p>
                      </>
                    ) : (
                      <>
                        <h3>{t('third_party_collection_detail_page.not_found')}</h3>
                        <p>{t('third_party_collection_detail_page.try_again')}</p>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )
    },
    [
      collection,
      selectedItems,
      isLoadingAvailableSlots,
      isLinkedWearablesPaymentsEnabled,
      isThirdPartyV2Enabled,
      totalItems,
      page,
      handleSelectItemChange,
      areAllSelected,
      handleChangeStatus,
      handleClearSelection,
      itemStatus
    ]
  )

  const shouldRender = hasAccess && collection

  return (
    <CollectionProvider id={collection?.id} itemsPage={page} itemsPageSize={PAGE_SIZE} fetchCollectionItemsOptions={itemFilters}>
      {({ isLoadingCollection, isLoadingCollectionItems, items, paginatedItems, onFetchCollectionItemsPages }) => (
        <LoggedInDetailPage
          className={styles.main}
          hasNavigation={!hasAccess && !isLoading && !isLoadingCollection}
          isLoading={isLoading || isLoadingCollection}
        >
          {shouldRender && thirdParty ? (
            renderPage(thirdParty, items, paginatedItems, isLoadingCollectionItems, onFetchCollectionItemsPages)
          ) : (
            <NotFound />
          )}
        </LoggedInDetailPage>
      )}
    </CollectionProvider>
  )
}
