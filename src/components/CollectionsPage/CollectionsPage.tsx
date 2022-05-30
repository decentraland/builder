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
  PaginationProps
} from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Icon from 'components/Icon'
import Chip from 'components/Chip'
import { locations } from 'routing/locations'
import { CollectionPageView } from 'modules/ui/collection/types'
import ItemCard from './ItemCard'
import ItemRow from './ItemRow'
import CollectionCard from './CollectionCard'
import CollectionRow from './CollectionRow'
import { Props, TABS } from './CollectionsPage.types'
import './CollectionsPage.css'

const PAGE_SIZE = 20

export default class CollectionsPage extends React.PureComponent<Props> {
  state = {
    currentTab: TABS.COLLECTIONS,
    page: 1
  }

  componentDidMount() {
    const { onFetchCollections, address } = this.props
    // fetch if already connected
    if (address) {
      onFetchCollections(address, { page: 1, limit: PAGE_SIZE })
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { onFetchCollections, address } = this.props
    // if it's the first page and it was not connected when mounting
    if (address && address !== prevProps.address) {
      onFetchCollections(address, { page: 1, limit: PAGE_SIZE })
    }
  }

  handleNewItem = () => {
    this.props.onOpenModal('CreateSingleItemModal', {})
  }

  handleNewCollection = () => {
    this.props.onOpenModal('CreateCollectionModal')
  }

  handleNewThirdPartyCollection = () => {
    this.props.onOpenModal('CreateThirdPartyCollectionModal')
  }

  handleOpenEditor = () => {
    const { onNavigate } = this.props
    onNavigate(locations.itemEditor())
  }

  handleTabChange = (tab: TABS) => {
    const { onFetchOrphanItems, onFetchCollections, address } = this.props
    this.setState({ currentTab: tab, page: 1 }, () => {
      const fetchFn = tab === TABS.ITEMS ? onFetchOrphanItems : onFetchCollections
      if (address) {
        fetchFn(address, { page: 1, limit: PAGE_SIZE })
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
    return (
      <Section>
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('global.item')}</Table.HeaderCell>
              <Table.HeaderCell>{t('collections_page.type')}</Table.HeaderCell>
              <Table.HeaderCell>
                {this.isCollectionTabActive() ? t('collections_page.collections') : t('collections_page.items')}
              </Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {this.isCollectionTabActive()
              ? collections.map(collection => <CollectionRow key={collection.id} collection={collection} />)
              : items.map(item => <ItemRow key={item.id} item={item} />)}
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
    const { page } = this.state
    onFetchCollections(address, { page, limit: PAGE_SIZE })
  }

  fetchItems = () => {
    const { address, onFetchOrphanItems } = this.props
    const { page } = this.state
    address && onFetchOrphanItems(address, { page, limit: PAGE_SIZE })
  }

  handlePageChange = (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
    this.setState({ page: +props.activePage! }, this.isCollectionTabActive() ? this.fetchCollections : this.fetchItems)
  }

  renderPage() {
    const {
      collectionsPaginationData,
      itemsPaginationData,
      view,
      isThirdPartyManager,
      onSetView,
      isLoadingItems,
      isLoadingCollections
    } = this.props
    const { page } = this.state
    const totalCollections = collectionsPaginationData?.total
    const totalItems = itemsPaginationData?.total
    const count = this.isCollectionTabActive() ? totalCollections : totalItems
    const totalPages = this.isCollectionTabActive() ? collectionsPaginationData?.totalPages : itemsPaginationData?.totalPages

    return (
      <>
        <div className="filters">
          <Container>
            <Tabs isFullscreen>
              <Tabs.Tab active={this.isCollectionTabActive()} onClick={() => this.handleTabChange(TABS.COLLECTIONS)}>
                {t('collections_page.collections')}
              </Tabs.Tab>
              <Tabs.Tab active={!this.isCollectionTabActive()} onClick={() => this.handleTabChange(TABS.ITEMS)}>
                {t('collections_page.single_items')}
              </Tabs.Tab>
              <Column align="right">
                <Row className="actions">
                  <Dropdown
                    trigger={
                      <Button basic className="create-item">
                        <Icon name="add-active" />
                      </Button>
                    }
                    inline
                    direction="left"
                  >
                    <Dropdown.Menu>
                      {this.isCollectionTabActive() ? (
                        <>
                          <Dropdown.Item text={t('collections_page.new_collection')} onClick={this.handleNewCollection} />
                          {isThirdPartyManager ? (
                            <Dropdown.Item
                              text={t('collections_page.new_third_party_collection')}
                              onClick={this.handleNewThirdPartyCollection}
                            />
                          ) : null}
                        </>
                      ) : (
                        <Dropdown.Item text={t('collections_page.new_item')} onClick={this.handleNewItem} />
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button className="open-editor" primary onClick={this.handleOpenEditor} size="tiny">
                    {t('item_editor.open')}
                  </Button>
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
            </Tabs>
            <Row height={30}>
              <Column>
                <Row>{!isLoadingItems && !!count && count > 0 && <Header sub>{t('collections_page.results', { count })}</Header>}</Row>
              </Column>
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
          <Card.Group>
            <div className="empty">
              <Header className="title" size="large">
                {t('collections_page.no_items')}
              </Header>
              <div className="empty-description">{t('collections_page.empty_description')}</div>
              <div className="create-new-wrapper">
                <div className="create-new create-new-item" onClick={this.handleNewItem}>
                  <div className="text">{t('collections_page.new_item')}</div>
                </div>
                <div className="create-new create-new-collection" onClick={this.handleNewCollection}>
                  <div className="text">{t('collections_page.new_collection')}</div>
                </div>
              </div>
            </div>
          </Card.Group>
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
