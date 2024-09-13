import { useState, useEffect, useCallback, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Container,
  Row,
  Column,
  Header,
  Card,
  Button,
  Dropdown,
  Table,
  Section,
  Tabs,
  Loader,
  Pagination,
  PaginationProps,
  DropdownProps,
  Field,
  InputOnChangeData,
  Icon as UIIcon
} from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Icon from 'components/Icon'
import Chip from 'components/Chip'
import EventBanner from 'components/EventBanner'
import { locations } from 'routing/locations'
import { CollectionPageView } from 'modules/ui/collection/types'
import { CurationSortOptions } from 'modules/curations/types'
import { usePagination } from 'lib/pagination'
import { CollectionType } from 'modules/collection/types'
import collectionsIcon from 'icons/collections.svg'
import ItemCard from './ItemCard'
import ItemRow from './ItemRow'
import CollectionCard from './CollectionCard'
import CollectionRow from './CollectionRow'
import { Props, TABS } from './CollectionsPage.types'
import './CollectionsPage.css'

const PAGE_SIZE = 20
export const LOCALSTORAGE_EMOTES_V2_ANNOUCEMENT = 'builder-emotes-2.0-announcement'

export default function CollectionsPage(props: Props) {
  const {
    address,
    items,
    collections,
    view,
    collectionsPaginationData,
    itemsPaginationData,
    hasUserOrphanItems,
    isLoadingItems,
    isLoadingCollections,
    isLoadingOrphanItem,
    isLinkedWearablesPaymentsEnabled,
    isThirdPartyManager,
    onFetchCollections,
    onFetchOrphanItem,
    onFetchOrphanItems,
    onOpenModal,
    onSetView
  } = props

  const history = useHistory()
  const { page, pages, goToPage, filters, changeFilter, sortBy, changeSorting } = usePagination<'search' | 'section', CurationSortOptions>({
    pageSize: PAGE_SIZE,
    count: collectionsPaginationData?.total
  })
  const currentTab = filters.section ?? TABS.STANDARD_COLLECTIONS
  const isViewingCollections = currentTab === TABS.STANDARD_COLLECTIONS || currentTab === TABS.THIRD_PARTY_COLLECTIONS
  const [search, setSearch] = useState<string>(filters.search ?? '')
  const timeout = useRef<NodeJS.Timeout | null>(null)

  // Fetch user orphan items
  useEffect(() => {
    if (hasUserOrphanItems === undefined && address) {
      onFetchOrphanItem(address)
    }
  }, [address, hasUserOrphanItems])

  // Fetch collections or orphan items
  useEffect(() => {
    if (address) {
      if (currentTab === TABS.ITEMS) {
        onFetchOrphanItems(address, { page, limit: PAGE_SIZE })
      } else {
        onFetchCollections(address, {
          page,
          limit: PAGE_SIZE,
          q: filters.search ?? undefined,
          type: currentTab === TABS.STANDARD_COLLECTIONS ? CollectionType.STANDARD : CollectionType.THIRD_PARTY,
          sort: sortBy
        })
      }
    }
  }, [address, page, currentTab, filters.search, sortBy, onFetchOrphanItems, onFetchCollections])

  const handleNewThirdPartyCollection = useCallback(() => {
    onOpenModal('CreateThirdPartyCollectionModal')
  }, [onOpenModal])

  const handleNewCollection = useCallback(() => {
    if (isLinkedWearablesPaymentsEnabled) {
      onOpenModal('CreateCollectionSelectorModal')
    } else {
      onOpenModal('CreateCollectionModal')
    }
  }, [onOpenModal, isLinkedWearablesPaymentsEnabled])

  const handleSearchChange = useCallback(
    (_evt: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setSearch(data.value)
      if (timeout.current) {
        clearTimeout(timeout.current)
        timeout.current = null
      }

      timeout.current = setTimeout(() => {
        changeFilter('search', data.value)
      }, 500)
    },
    [changeFilter]
  )

  const handleOpenEditor = useCallback(() => {
    history.push(locations.itemEditor())
  }, [history])

  const handleSortChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
      const sort = value as CurationSortOptions
      changeSorting(sort)
    },
    [changeSorting]
  )

  const handleTabChange = useCallback(
    (tab: TABS) => {
      if (currentTab !== tab) {
        changeFilter('section', tab)
      }
    },
    [address, currentTab, changeFilter]
  )

  const renderGrid = useCallback(() => {
    return (
      <Card.Group>
        {isViewingCollections ? (
          collections.map((collection, index) => <CollectionCard key={index} collection={collection} />)
        ) : isLoadingItems ? (
          <Loader size="large" active />
        ) : (
          items.map((item, index) => <ItemCard key={index} item={item} />)
        )}
      </Card.Group>
    )
  }, [items, collections, isLoadingItems, isViewingCollections, currentTab])

  const renderList = useCallback(() => {
    if (isViewingCollections) {
      return (
        <Section>
          <Table basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t('collections_page.collection')}</Table.HeaderCell>
                <Table.HeaderCell>{t('collections_page.type')}</Table.HeaderCell>
                <Table.HeaderCell>{t('collections_page.items')}</Table.HeaderCell>
                <Table.HeaderCell>{t('collections_page.created_at')}</Table.HeaderCell>
                <Table.HeaderCell>{t('collections_page.last_modified')}</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {collections.map(collection => (
                <CollectionRow key={collection.id} collection={collection} />
              ))}
            </Table.Body>
          </Table>
        </Section>
      )
    }

    return (
      <Section>
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('global.item')}</Table.HeaderCell>
              <Table.HeaderCell>{t('collections_page.created_at')}</Table.HeaderCell>
              <Table.HeaderCell>{t('collections_page.last_modified')}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map(item => (
              <ItemRow key={item.id} item={item} />
            ))}
          </Table.Body>
        </Table>
      </Section>
    )
  }, [items, collections, isViewingCollections])

  const handlePageChange = useCallback(
    (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
      if (page !== props.activePage) {
        goToPage(Number(props.activePage))
      }
    },
    [page, goToPage]
  )

  const renderMainActions = useCallback(() => {
    return (
      <div className="collections-main-actions">
        {currentTab !== TABS.ITEMS && (
          <Field
            placeholder={t('itemdrawer.search_items')}
            className="collections-search-field"
            input={{ icon: 'search' }}
            onChange={handleSearchChange}
            icon={<UIIcon name="search" className="searchIcon" />}
            iconPosition="left"
            value={search}
            isClearable
          />
        )}
        <Row className="actions" grow={false}>
          {isThirdPartyManager && !isLinkedWearablesPaymentsEnabled && (
            <Button className="action-button" size="small" basic onClick={handleNewThirdPartyCollection}>
              {t('collections_page.new_third_party_collection')}
            </Button>
          )}
          <Button className="action-button open-editor" size="small" basic onClick={handleOpenEditor}>
            <Icon name="cube" />
            {t('item_editor.open')}
          </Button>
          <Button className="action-button" size="small" primary onClick={handleNewCollection}>
            <UIIcon name="plus square" /> {t('collections_page.new_collection')}
          </Button>
        </Row>
      </div>
    )
  }, [search, isThirdPartyManager, isLinkedWearablesPaymentsEnabled, handleSearchChange, handleOpenEditor, handleNewCollection])

  const renderViewActions = useCallback(() => {
    return (
      <Column align="right">
        <Row className="actions">
          {currentTab === TABS.STANDARD_COLLECTIONS ||
            (TABS.THIRD_PARTY_COLLECTIONS && (
              <Dropdown
                direction="left"
                value={sortBy}
                options={[
                  { value: CurationSortOptions.MOST_RELEVANT, text: t('curation_page.order.most_relevant') },
                  { value: CurationSortOptions.CREATED_AT_DESC, text: t('global.order.newest') },
                  { value: CurationSortOptions.CREATED_AT_ASC, text: t('global.order.oldest') },
                  { value: CurationSortOptions.UPDATED_AT_DESC, text: t('global.order.updated_at_desc') },
                  { value: CurationSortOptions.UPDATED_AT_ASC, text: t('global.order.updated_at_asc') },
                  { value: CurationSortOptions.NAME_DESC, text: t('global.order.name_desc') },
                  { value: CurationSortOptions.NAME_ASC, text: t('global.order.name_asc') }
                ]}
                onChange={handleSortChange}
              />
            ))}
          <Chip
            className="grid"
            icon="grid"
            isActive={view === CollectionPageView.GRID}
            onClick={() => onSetView(CollectionPageView.GRID)}
          />
          <Chip
            className="list"
            icon="table"
            isActive={view === CollectionPageView.LIST}
            onClick={() => onSetView(CollectionPageView.LIST)}
          />
        </Row>
      </Column>
    )
  }, [view, onSetView, sortBy, handleSortChange])

  const renderPage = useCallback(() => {
    const totalCollections = collectionsPaginationData?.total
    const totalItems = itemsPaginationData?.total
    const count = currentTab === TABS.STANDARD_COLLECTIONS || currentTab === TABS.THIRD_PARTY_COLLECTIONS ? totalCollections : totalItems
    const totalPages =
      currentTab === TABS.STANDARD_COLLECTIONS || currentTab === TABS.THIRD_PARTY_COLLECTIONS ? pages : itemsPaginationData?.totalPages

    if (isLoadingOrphanItem) {
      return <Loader active size="large" />
    }

    return (
      <>
        <EventBanner />
        <div className="filters">
          <Container>
            {(hasUserOrphanItems || isThirdPartyManager) && (
              <div className="action-tabs-container">
                <img src={collectionsIcon} className="collections-icon" />
                <Tabs isFullscreen>
                  <Tabs.Tab active={currentTab === TABS.STANDARD_COLLECTIONS} onClick={() => handleTabChange(TABS.STANDARD_COLLECTIONS)}>
                    {t('collections_page.collections')}
                  </Tabs.Tab>
                  {(isThirdPartyManager || isLinkedWearablesPaymentsEnabled) && (
                    <Tabs.Tab
                      active={currentTab === TABS.THIRD_PARTY_COLLECTIONS}
                      onClick={() => handleTabChange(TABS.THIRD_PARTY_COLLECTIONS)}
                    >
                      {t('collections_page.third_party_collections')}
                    </Tabs.Tab>
                  )}
                  {hasUserOrphanItems && (
                    // TODO: Remove tabs when there are no users with orphan items
                    <Tabs.Tab active={currentTab === TABS.ITEMS} onClick={() => handleTabChange(TABS.ITEMS)}>
                      {t('collections_page.single_items')}
                    </Tabs.Tab>
                  )}
                </Tabs>
              </div>
            )}
            {renderMainActions()}
            <Row height={30}>
              <Column>
                <Row>
                  {!isLoadingItems && !isLoadingCollections && !!count && count > 0 && (
                    <Header sub>{t('collections_page.results', { count })}</Header>
                  )}
                </Row>
              </Column>
              {renderViewActions()}
            </Row>
          </Container>
        </div>

        {isLoadingItems || isLoadingCollections || count === undefined ? (
          <Loader active size="large" />
        ) : count > 0 ? (
          <>
            {view === CollectionPageView.GRID ? renderGrid() : view === CollectionPageView.LIST ? renderList() : null}
            {!!totalPages && totalPages > 1 && (
              <Pagination
                className="pagination"
                firstItem={null}
                lastItem={null}
                totalPages={totalPages}
                activePage={page}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="empty">
            <Header className="title" size="large">
              {t('collections_page.no_items')}
            </Header>
            <div className="empty-description">{t('collections_page.empty_description')}</div>
            <div className="create-new-wrapper">
              <div className="create-new create-new-collection" onClick={handleNewCollection}>
                <div className="text">{t('collections_page.new_collection')}</div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }, [
    page,
    pages,
    collectionsPaginationData,
    itemsPaginationData,
    view,
    hasUserOrphanItems,
    isLoadingItems,
    isLoadingCollections,
    isLoadingOrphanItem,
    isLinkedWearablesPaymentsEnabled,
    isThirdPartyManager,
    handlePageChange,
    handleNewCollection,
    renderGrid,
    renderList,
    renderViewActions,
    renderMainActions
  ])

  return (
    <LoggedInDetailPage className="CollectionsPage" activeTab={NavigationTab.COLLECTIONS}>
      {renderPage()}
    </LoggedInDetailPage>
  )
}
