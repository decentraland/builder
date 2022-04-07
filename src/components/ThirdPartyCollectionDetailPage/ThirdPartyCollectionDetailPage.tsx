import * as React from 'react'
import classNames from 'classnames'
import CopyToClipboard from 'react-copy-to-clipboard'
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
  CheckboxProps
} from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { hasAuthorization } from 'decentraland-dapps/dist/modules/authorization/utils'
import { ContractName } from 'decentraland-transactions'
import { getArrayOfPagesFromTotal } from 'lib/api/pagination'
import { locations } from 'routing/locations'
import { isUserManagerOfThirdParty } from 'modules/thirdParty/utils'
import { Item } from 'modules/item/types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import CollectionProvider from 'components/CollectionProvider'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import { AuthorizationModal } from 'components/AuthorizationModal'
import { buildManaAuthorization } from 'lib/mana'
import CollectionContextMenu from './CollectionContextMenu'
import CollectionPublishButton from './CollectionPublishButton'
import CollectionItem from './CollectionItem'
import { Props, State, PAGE_SIZE } from './ThirdPartyCollectionDetailPage.types'
import { ThirdParty } from 'modules/thirdParty/types'
import './ThirdPartyCollectionDetailPage.css'

const STORAGE_KEY = 'dcl-third-party-collection-notice'

export default class ThirdPartyCollectionDetailPage extends React.PureComponent<Props, State> {
  state: State = {
    selectedItems: {},
    searchText: '',
    page: this.props.currentPage,
    isAuthModalOpen: false,
    showSelectAllPages: false,
    shouldFetchAllPages: false
  }

  componentDidMount() {
    const { thirdParty, onFetchAvailableSlots, isLoadingAvailableSlots } = this.props
    if (thirdParty && thirdParty.availableSlots === undefined && !isLoadingAvailableSlots) {
      onFetchAvailableSlots(thirdParty.id)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { page, shouldFetchAllPages } = this.state
    const { items, thirdParty, isLoadingAvailableSlots, onFetchAvailableSlots, currentPage } = this.props

    const shouldFetchAvailbleSlots = thirdParty && thirdParty.availableSlots === undefined && !isLoadingAvailableSlots
    if (shouldFetchAvailbleSlots) {
      onFetchAvailableSlots(thirdParty.id)
    }
    // update the state if the page query param changes
    if (currentPage !== page) {
      this.setState({ page: currentPage })
    }
    if (prevProps.items !== items && shouldFetchAllPages) {
      // select all items in the state
      const selectedItems = items.reduce((acc, item) => {
        acc[item.id] = true
        return acc
      }, {} as Record<string, boolean>)
      this.setState({ selectedItems, showSelectAllPages: false })
    }
  }

  getManaAuthorization = () => {
    const { wallet } = this.props
    return buildManaAuthorization(wallet.address, wallet.networks.MATIC.chainId, ContractName.ThirdPartyRegistry)
  }

  handleNewItems = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CreateItemsModal', { collectionId: collection!.id })
  }

  handleEditName = () => {
    const { collection, onOpenModal } = this.props
    if (collection) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }

  handleAuthModalClose = () => {
    this.setState({ isAuthModalOpen: false })
  }

  handleBuySlot = () => {
    const { onOpenModal, thirdParty, authorizations } = this.props
    const manaAuthorization = this.getManaAuthorization()
    if (hasAuthorization(authorizations, manaAuthorization)) {
      this.setState({ isAuthModalOpen: false })
      onOpenModal('BuyItemSlotsModal', {
        thirdParty
      })
    } else {
      this.setState({ isAuthModalOpen: true })
    }
  }

  handleGoBack = () => {
    this.props.onNavigate(locations.collections())
  }

  handlePageChange = (_event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
    const { collection, onPageChange } = this.props
    this.setState({ page: +data.activePage! })
    onPageChange(collection!.id, +data.activePage!) // pushes the query param to the url
  }

  handeSearchChange = (searchText: string) => {
    if (searchText) {
      this.setState({ page: 1, searchText })
    }
  }

  handleSelectItemChange = (item: Item, isSelected: boolean) => {
    const { selectedItems } = this.state
    this.setState({
      selectedItems: {
        ...selectedItems,
        [item.id]: isSelected
      },
      shouldFetchAllPages: false,
      showSelectAllPages: false
    })
  }

  handleSelectPageChange = (items: Item[], data: CheckboxProps) => {
    const { selectedItems, shouldFetchAllPages } = this.state
    const newItemSelectionState: Record<string, boolean> = { ...selectedItems }

    // Performs the opposite action, if everything is selected, it'll deselect and viceversa
    const isSelected = !this.areAllSelected(items)

    for (const item of items) {
      newItemSelectionState[item.id] = isSelected
    }

    this.setState({
      selectedItems: newItemSelectionState,
      showSelectAllPages: true,
      shouldFetchAllPages: shouldFetchAllPages && !!data.checked // if the checkbox is unchecked, turn off shouldFetchAllPages flag
    })
  }

  handleClearSelection = () => {
    this.setState({ selectedItems: {} })
  }

  hasItems(items: Item[]) {
    return items.length > 0
  }

  hasAccess() {
    const { wallet, collection, thirdParty } = this.props
    return collection && thirdParty && isUserManagerOfThirdParty(wallet.address, thirdParty)
  }

  areAllSelected(items: Item[]) {
    const { selectedItems } = this.state
    return items.every(item => selectedItems[item.id])
  }

  getSelectedItems(items: Item[]) {
    const { selectedItems, shouldFetchAllPages } = this.state
    return shouldFetchAllPages ? items : items.filter(item => selectedItems[item.id])
  }

  isSearching() {
    return this.state.searchText !== ''
  }

  filterItemsBySearchText(items: Item[]) {
    const { searchText } = this.state

    return items.filter(
      item => item.name.toLowerCase().includes(searchText.toLowerCase()) || item.owner.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  paginate(items: Item[]) {
    const { page } = this.state
    return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }

  handleSelectAllItems = (onFetchAllCollectionItems: (id: string, pages: number[], limit: number) => void) => {
    const { collection, totalItems } = this.props
    this.setState({ shouldFetchAllPages: true })
    if (collection) {
      const totalPages = Math.ceil(totalItems! / PAGE_SIZE)
      onFetchAllCollectionItems(collection.id, getArrayOfPagesFromTotal(totalPages), PAGE_SIZE)
    }
  }

  renderPage(
    thirdParty: ThirdParty,
    allItems: Item[],
    paginatedItems: Item[],
    onFetchCollectionItemsPages: (id: string, pages: number[], limit: number) => void
  ) {
    const { totalItems, isLoadingAvailableSlots } = this.props
    const { page, searchText, selectedItems: stateSelectedItems, isAuthModalOpen, showSelectAllPages } = this.state

    const collection = this.props.collection!
    const areSlotsEmpty = thirdParty?.availableSlots && thirdParty.availableSlots <= 0
    const selectedItems = allItems.filter(item => stateSelectedItems[item.id])
    const selectedItemsCount = selectedItems.length
    const total = totalItems!
    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
      <>
        <Section>
          <Row>
            <Back absolute onClick={this.handleGoBack} />
            <Narrow>
              <Row>
                <Column className="header-column">
                  <Row className="header-row" onClick={this.handleEditName}>
                    <Header size="huge" className="name">
                      {collection.name}
                    </Header>
                    <BuilderIcon name="edit" className="edit-collection-name" />
                  </Row>
                  <Row>
                    <small className="urn">
                      <CopyToClipboard text={collection.urn}>
                        <div>
                          {collection.urn}
                          <Icon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
                        </div>
                      </CopyToClipboard>
                    </small>
                  </Row>
                </Column>
                <Column align="right" shrink={false}>
                  <Row className="actions">
                    <Button
                      loading={isLoadingAvailableSlots}
                      secondary
                      compact
                      className={classNames({ empty: areSlotsEmpty && !isLoadingAvailableSlots, slots: !isLoadingAvailableSlots })}
                      onClick={this.handleBuySlot}
                    >
                      <>
                        {t('third_party_collection_detail_page.slots', { amount: thirdParty?.availableSlots })}
                        {areSlotsEmpty ? <span className="buy-slots link">{t('global.buy')}</span> : null}
                      </>
                    </Button>
                    <Button secondary compact className={'add-items'} onClick={this.handleNewItems}>
                      {t('third_party_collection_detail_page.new_items')}
                    </Button>
                    {thirdParty.availableSlots !== undefined ? (
                      <CollectionPublishButton collection={collection} items={selectedItems} slots={thirdParty.availableSlots} />
                    ) : null}
                    <CollectionContextMenu collection={collection} />
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          <Notice storageKey={STORAGE_KEY}>
            <T
              id="third_party_collection_detail_page.notice"
              values={{
                buy_link: (
                  <span className="link" onClick={this.handleBuySlot}>
                    {t('global.click_here')}
                  </span>
                )
              }}
            />
          </Notice>

          {paginatedItems.length ? (
            <>
              <div className="search-container">
                <TextFilter
                  placeholder={t('third_party_collection_detail_page.search_placeholder', { count: total })}
                  value={searchText}
                  onChange={this.handeSearchChange}
                />

                <div className="search-info secondary-text">
                  {t('third_party_collection_detail_page.search_info', {
                    page: (page - 1) * PAGE_SIZE + 1,
                    pageTotal: Math.min(total, page * PAGE_SIZE),
                    total
                  })}
                </div>
              </div>

              {selectedItemsCount > 0 ? (
                <div className="selection-info">
                  {t('third_party_collection_detail_page.selection', { count: selectedItemsCount })}
                  &nbsp;
                  <span className="link" onClick={this.handleClearSelection}>
                    {t('third_party_collection_detail_page.clear_selection')}
                  </span>
                  . &nbsp;
                  {showSelectAllPages ? (
                    <span className="link" onClick={() => this.handleSelectAllItems(onFetchCollectionItemsPages)}>
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
                        checked={this.areAllSelected(paginatedItems)}
                        onClick={(_event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) =>
                          this.handleSelectPageChange(paginatedItems, data)
                        }
                      />
                      &nbsp;
                      {t('global.item')}
                    </Grid.Column>
                    <Grid.Column>{t('global.category')}</Grid.Column>
                    <Grid.Column>{t('global.body_shape')}</Grid.Column>
                    <Grid.Column>URN ID</Grid.Column>
                    <Grid.Column></Grid.Column>
                  </Grid.Row>
                </Grid>

                {paginatedItems.map(item => (
                  <CollectionItem
                    key={item.id}
                    collection={collection}
                    item={item}
                    selected={!!stateSelectedItems[item.id]}
                    onSelect={this.handleSelectItemChange}
                  />
                ))}

                {totalPages > 1 ? (
                  <Pagination
                    firstItem={null}
                    lastItem={null}
                    totalPages={totalPages}
                    activePage={page}
                    onPageChange={this.handlePageChange}
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
        <AuthorizationModal
          open={isAuthModalOpen}
          authorization={this.getManaAuthorization()}
          onProceed={this.handleBuySlot}
          onCancel={this.handleAuthModalClose}
        />
      </>
    )
  }

  render() {
    const { page } = this.state
    const { isLoading, collection, thirdParty } = this.props
    const hasAccess = this.hasAccess()
    const shouldRender = hasAccess && collection
    return (
      <CollectionProvider id={collection?.id} itemsPage={page} itemsPageSize={PAGE_SIZE}>
        {({ isLoading: isLoadingCollectionData, items, paginatedItems, onFetchCollectionItemsPages }) => (
          <LoggedInDetailPage
            className="ThirdPartyCollectionDetailPage"
            hasNavigation={!hasAccess && !isLoading}
            isLoading={isLoading || isLoadingCollectionData}
          >
            {shouldRender && thirdParty ? this.renderPage(thirdParty, items, paginatedItems, onFetchCollectionItemsPages) : <NotFound />}
          </LoggedInDetailPage>
        )}
      </CollectionProvider>
    )
  }
}
