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
    isLinkedWearablesV2Enabled,
    isThirdPartyManager,
    onFetchCollections,
    onFetchOrphanItem,
    onFetchOrphanItems,
    onOpenModal,
    onSetView
  } = props

  const [currentTab, setCurrentTab] = useState<TABS>(TABS.COLLECTIONS)
  const [sort, setSort] = useState<CurationSortOptions>(CurationSortOptions.CREATED_AT_DESC)
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const history = useHistory()

  useEffect(() => {
    if (address) {
      onFetchCollections(address, { page: 1, limit: PAGE_SIZE, sort })
      if (hasUserOrphanItems === undefined) {
        onFetchOrphanItem(address)
      }
    }
  }, [address, sort])

  const handleNewThirdPartyCollection = useCallback(() => {
    onOpenModal('CreateThirdPartyCollectionModal')
  }, [onOpenModal, isLinkedWearablesV2Enabled])

  const handleNewCollection = useCallback(() => {
    if (isLinkedWearablesV2Enabled) {
      onOpenModal('CreateCollectionSelectorModal')
    } else {
      onOpenModal('CreateCollectionModal')
    }
  }, [onOpenModal, isLinkedWearablesV2Enabled])

  const handleSearchChange = (_evt: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    setSearch(data.value)
    if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = null
    }

    timeout.current = setTimeout(() => {
      onFetchCollections(address, { page: 1, limit: PAGE_SIZE, q: data.value })
    }, 500)
  }

  const handleOpenEditor = useCallback(() => {
    history.push(locations.itemEditor())
  }, [history])

  const handleSortChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
      const sort = value as CurationSortOptions
      setSort(sort)
      setPage(1)
      onFetchCollections(address, { page: 1, limit: PAGE_SIZE, sort })
    },
    [address]
  )

  const handleTabChange = useCallback(
    (tab: TABS) => {
      setCurrentTab(tab)
      setPage(1)
      const fetchFn = tab === TABS.ITEMS ? onFetchOrphanItems : onFetchCollections
      const params = tab === TABS.ITEMS ? { page: 1, limit: PAGE_SIZE } : { page: 1, limit: PAGE_SIZE, sort }
      if (address) {
        fetchFn(address, params)
      }
    },
    [address]
  )

  const renderGrid = useCallback(() => {
    return (
      <Card.Group>
        {currentTab === TABS.COLLECTIONS ? (
          collections.map((collection, index) => <CollectionCard key={index} collection={collection} />)
        ) : isLoadingItems ? (
          <Loader size="large" active />
        ) : (
          items.map((item, index) => <ItemCard key={index} item={item} />)
        )}
      </Card.Group>
    )
  }, [items, collections, isLoadingItems, currentTab])

  const renderList = useCallback(() => {
    if (currentTab === TABS.COLLECTIONS) {
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
  }, [currentTab, items, collections])

  const fetchCollections = useCallback(() => {
    onFetchCollections(address, { page, limit: PAGE_SIZE, sort })
  }, [onFetchCollections, page, address, sort])

  const fetchItems = useCallback(() => {
    if (address) {
      onFetchOrphanItems(address, { page, limit: PAGE_SIZE })
    }
  }, [onFetchOrphanItems, address, page])

  const handlePageChange = useCallback(
    (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
      setPage(+props.activePage!)
      if (currentTab === TABS.COLLECTIONS) {
        fetchCollections()
      } else {
        fetchItems()
      }
    },
    [currentTab, fetchCollections, fetchItems]
  )

  const renderMainActions = useCallback(() => {
    return (
      <div className="collections-main-actions">
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
        <Row className="actions" grow={false}>
          {isThirdPartyManager && !isLinkedWearablesV2Enabled && (
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
  }, [search, isThirdPartyManager, isLinkedWearablesV2Enabled, handleSearchChange, handleOpenEditor, handleNewCollection])

  const renderViewActions = useCallback(() => {
    return (
      <Column align="right">
        <Row className="actions">
          {currentTab === TABS.COLLECTIONS && (
            <Dropdown
              direction="left"
              value={sort}
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
          )}
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
  }, [view, onSetView, sort, handleSortChange])

  const renderPage = useCallback(() => {
    const totalCollections = collectionsPaginationData?.total
    const totalItems = itemsPaginationData?.total
    const count = currentTab === TABS.COLLECTIONS ? totalCollections : totalItems
    const totalPages = currentTab === TABS.COLLECTIONS ? collectionsPaginationData?.totalPages : itemsPaginationData?.totalPages

    if (isLoadingOrphanItem) {
      return <Loader active size="large" />
    }

    return (
      <>
        <EventBanner />
        <div className="filters">
          <Container>
            {hasUserOrphanItems && (
              // TODO: Remove tabs when there are no users with orphan items
              <Tabs isFullscreen>
                <Tabs.Tab active={currentTab === TABS.COLLECTIONS} onClick={() => handleTabChange(TABS.COLLECTIONS)}>
                  {t('collections_page.collections')}
                </Tabs.Tab>
                <Tabs.Tab active={currentTab !== TABS.COLLECTIONS} onClick={() => handleTabChange(TABS.ITEMS)}>
                  {t('collections_page.single_items')}
                </Tabs.Tab>
              </Tabs>
            )}
            {renderMainActions()}
            <Row height={30}>
              <Column>
                <Row>{!isLoadingItems && !!count && count > 0 && <Header sub>{t('collections_page.results', { count })}</Header>}</Row>
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
    collectionsPaginationData,
    itemsPaginationData,
    view,
    hasUserOrphanItems,
    isLoadingItems,
    isLoadingCollections,
    isLoadingOrphanItem,
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
