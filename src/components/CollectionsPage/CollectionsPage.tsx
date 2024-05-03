import * as React from 'react'
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
export default class CollectionsPage extends React.PureComponent<Props> {
  state = {
    currentTab: TABS.COLLECTIONS,
    sort: CurationSortOptions.CREATED_AT_DESC,
    page: 1,
    search: ''
  }

  timeout: ReturnType<typeof setTimeout> | undefined = undefined

  componentDidMount() {
    const { address, hasUserOrphanItems, onFetchCollections, onFetchOrphanItem, onOpenModal } = this.props
    // fetch if already connected
    if (address) {
      onFetchCollections(address, { page: 1, limit: PAGE_SIZE, sort: CurationSortOptions.CREATED_AT_DESC })
      // TODO: Remove this call when there are no users with orphan items
      if (hasUserOrphanItems === undefined) {
        onFetchOrphanItem(address)
      }

      if (!localStorage.getItem(LOCALSTORAGE_EMOTES_V2_ANNOUCEMENT)) {
        onOpenModal('EmotesV2AnnouncementModal')
      }
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { address, hasUserOrphanItems, onFetchCollections, onFetchOrphanItem } = this.props
    const { sort } = this.state
    // if it's the first page and it was not connected when mounting
    if (address && address !== prevProps.address) {
      onFetchCollections(address, { page: 1, limit: PAGE_SIZE, sort })
      // TODO: Remove this call when there are no users with orphan items
      if (hasUserOrphanItems === undefined) {
        onFetchOrphanItem(address)
      }
    }
  }

  handleNewCollection = () => {
    this.props.onOpenModal('CreateCollectionModal')
  }

  handleNewThirdPartyCollection = () => {
    this.props.onOpenModal('CreateThirdPartyCollectionModal')
  }

  handleSearchChange = (_evt: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    const { onFetchCollections, address } = this.props
    this.setState({ search: data.value })
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(() => {
      onFetchCollections(address, { page: 1, limit: PAGE_SIZE, q: data.value })
    }, 500)
  }

  handleOpenEditor = () => {
    const { onNavigate } = this.props
    onNavigate(locations.itemEditor())
  }

  handleSortChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const { onFetchCollections, address } = this.props
    const sort = value as CurationSortOptions
    this.setState({ sort, page: 1 })
    onFetchCollections(address, { page: 1, limit: PAGE_SIZE, sort })
  }

  handleTabChange = (tab: TABS) => {
    const { onFetchOrphanItems, onFetchCollections, address } = this.props
    const { sort } = this.state
    this.setState({ currentTab: tab, page: 1 }, () => {
      const fetchFn = tab === TABS.ITEMS ? onFetchOrphanItems : onFetchCollections
      const params = tab === TABS.ITEMS ? { page: 1, limit: PAGE_SIZE } : { page: 1, limit: PAGE_SIZE, sort }
      if (address) {
        fetchFn(address, params)
      }
    })
  }

  renderGrid() {
    const { items, collections, isLoadingItems } = this.props
    return (
      <Card.Group>
        {this.isCollectionTabActive() ? (
          collections.map((collection, index) => <CollectionCard key={index} collection={collection} />)
        ) : isLoadingItems ? (
          <Loader size="large" active />
        ) : (
          items.map((item, index) => <ItemCard key={index} item={item} />)
        )}
      </Card.Group>
    )
  }

  renderList() {
    const { items, collections } = this.props

    if (this.isCollectionTabActive()) {
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
  }

  isCollectionTabActive = () => {
    const { currentTab } = this.state
    return currentTab === TABS.COLLECTIONS
  }

  fetchCollections = () => {
    const { address, onFetchCollections } = this.props
    const { page, sort } = this.state
    onFetchCollections(address, { page, limit: PAGE_SIZE, sort })
  }

  fetchItems = () => {
    // TODO: Remove this call when there are no users with orphan items
    const { address, onFetchOrphanItems } = this.props
    const { page } = this.state
    address && onFetchOrphanItems(address, { page, limit: PAGE_SIZE })
  }

  handlePageChange = (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
    this.setState({ page: +props.activePage! }, this.isCollectionTabActive() ? this.fetchCollections : this.fetchItems)
  }

  renderMainActions = () => {
    const { isThirdPartyManager } = this.props
    const { search } = this.state
    return (
      <div className="collections-main-actions">
        <Field
          placeholder={t('itemdrawer.search_items')}
          className="collections-search-field"
          input={{ icon: 'search', iconPosition: 'left', inverted: true }}
          onChange={this.handleSearchChange}
          icon={<UIIcon name="search" className="searchIcon" />}
          iconPosition="left"
          value={search}
          isClearable
        />
        <Row className="actions" grow={false}>
          {isThirdPartyManager && (
            <Button className="action-button" size="small" basic onClick={this.handleNewThirdPartyCollection}>
              {t('collections_page.new_third_party_collection')}
            </Button>
          )}
          <Button className="action-button open-editor" size="small" basic onClick={this.handleOpenEditor}>
            <Icon name="cube" />
            {t('item_editor.open')}
          </Button>
          <Button className="action-button" size="small" primary onClick={this.handleNewCollection}>
            {t('collections_page.new_collection')}
          </Button>
        </Row>
      </div>
    )
  }

  renderViewActions = () => {
    const { view, onSetView } = this.props
    const { sort } = this.state
    return (
      <Column align="right">
        <Row className="actions">
          {this.isCollectionTabActive() && (
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
              onChange={this.handleSortChange}
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
  }

  renderPage() {
    const {
      collectionsPaginationData,
      itemsPaginationData,
      view,
      hasUserOrphanItems,
      isLoadingItems,
      isLoadingCollections,
      isLoadingOrphanItem
    } = this.props
    const { page } = this.state
    const totalCollections = collectionsPaginationData?.total
    const totalItems = itemsPaginationData?.total
    const count = this.isCollectionTabActive() ? totalCollections : totalItems
    const totalPages = this.isCollectionTabActive() ? collectionsPaginationData?.totalPages : itemsPaginationData?.totalPages

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
                <Tabs.Tab active={this.isCollectionTabActive()} onClick={() => this.handleTabChange(TABS.COLLECTIONS)}>
                  {t('collections_page.collections')}
                </Tabs.Tab>
                <Tabs.Tab active={!this.isCollectionTabActive()} onClick={() => this.handleTabChange(TABS.ITEMS)}>
                  {t('collections_page.single_items')}
                </Tabs.Tab>
              </Tabs>
            )}
            {this.renderMainActions()}
            <Row height={30}>
              <Column>
                <Row>{!isLoadingItems && !!count && count > 0 && <Header sub>{t('collections_page.results', { count })}</Header>}</Row>
              </Column>
              {this.renderViewActions()}
            </Row>
          </Container>
        </div>

        {isLoadingItems || isLoadingCollections || count === undefined ? (
          <Loader active size="large" />
        ) : count > 0 ? (
          <>
            {view === CollectionPageView.GRID ? this.renderGrid() : view === CollectionPageView.LIST ? this.renderList() : null}
            {!!totalPages && totalPages > 1 && (
              <Pagination
                className="pagination"
                firstItem={null}
                lastItem={null}
                totalPages={totalPages}
                activePage={page}
                onPageChange={this.handlePageChange}
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
              <div className="create-new create-new-collection" onClick={this.handleNewCollection}>
                <div className="text">{t('collections_page.new_collection')}</div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  render() {
    return (
      <LoggedInDetailPage className="CollectionsPage" activeTab={NavigationTab.COLLECTIONS}>
        {this.renderPage()}
      </LoggedInDetailPage>
    )
  }
}
