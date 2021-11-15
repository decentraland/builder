import * as React from 'react'
import BN from 'bn.js'
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
  Checkbox
} from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { canSeeCollection } from 'modules/collection/utils'
import { getAvailableSlots, isUserManagerOfThirdParty } from 'modules/thirdParty/utils'
import { Item } from 'modules/item/types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import Info from 'components/Info'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import CollectionContextMenu from './CollectionContextMenu'
import CollectionPublishButton from './CollectionPublishButton'
import CollectionItem from './CollectionItem'
import { Props, State } from './ThirdPartyCollectionDetailPage.types'

import './ThirdPartyCollectionDetailPage.css'

const STORAGE_KEY = 'dcl-third-party-collection-notice'
const MAX_ITEM_COUNT = 20
const PAGE_SIZE = 20

export default class ThirdPartyCollectionDetailPage extends React.PureComponent<Props, State> {
  state: State = {
    itemSelectionState: {},
    searchText: '',
    page: 1
  }

  handleEditName = () => {
    const { collection, onOpenModal } = this.props
    if (collection) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }

  handleBuySlot = () => {
    const { onOpenModal, thirdParty } = this.props
    onOpenModal('BuyItemSlotsModal', {
      thirdParty
    })
  }

  handleGoBack = () => {
    this.props.onNavigate(locations.collections())
  }

  handlePageChange = (_event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
    this.setState({ page: +data.activePage! })
  }

  handeSearchChange = (searchText: string) => {
    this.setState({ page: 1, searchText })
  }

  handleSelectItemChange = (item: Item, isSelected: boolean) => {
    const { itemSelectionState } = this.state
    this.setState({
      itemSelectionState: {
        ...itemSelectionState,
        [item.id]: isSelected
      }
    })
  }

  handleSelectPageChange = () => {
    const { itemSelectionState } = this.state
    const items = this.paginate(this.filterItemsBySearchText())
    const newItemSelectionState: Record<string, boolean> = { ...itemSelectionState }

    // Performs the opposite actoin, if everything is selected, it'll deselect and viceversa
    const isSelected = !this.areAllSelected(items)

    for (const item of items) {
      newItemSelectionState[item.id] = isSelected
    }

    this.setState({ itemSelectionState: newItemSelectionState })
  }

  handleClearSelection = () => {
    this.setState({ itemSelectionState: {} })
  }

  hasItems() {
    const { items } = this.props
    return items.length > 0
  }

  hasAccess() {
    const { wallet, collection, thirdParty } = this.props
    return collection && thirdParty && isUserManagerOfThirdParty(wallet.address, thirdParty)
  }

  areAllSelected(items: Item[]) {
    const { itemSelectionState } = this.state
    return items.every(item => itemSelectionState[item.id])
  }

  getSelectedItemsCount() {
    const { itemSelectionState } = this.state
    return Object.values(itemSelectionState).filter(isSelected => isSelected).length
  }

  isSearching() {
    return this.state.searchText !== ''
  }

  filterItemsBySearchText() {
    const { items } = this.props
    const { searchText } = this.state

    return items.filter(
      item => item.name.toLowerCase().includes(searchText.toLowerCase()) || item.owner.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  paginate(items: Item[]) {
    const { page } = this.state
    return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }

  renderPage() {
    const { wallet, thirdParty } = this.props
    const { page, searchText, itemSelectionState } = this.state
    const collection = this.props.collection!
    const slots = thirdParty ? getAvailableSlots(thirdParty) : new BN(0)
    const areSlotsEmpty = slots.lte(new BN(0))

    const selectedItemsCount = this.getSelectedItemsCount()

    const items = this.filterItemsBySearchText()
    const paginatedItems = this.paginate(items)
    const total = items.length
    const pageTotal = total > PAGE_SIZE ? PAGE_SIZE * page : total

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
                      <CopyToClipboard text={collection.urn!}>
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
                    <Button secondary compact className={`${areSlotsEmpty ? 'empty' : ''} slots`} onClick={this.handleBuySlot}>
                      {t('third_party_collection_detail_page.slots', { amount: slots.toNumber() })}
                      {areSlotsEmpty ? (
                        <span className="buy-slots link" onClick={this.handleBuySlot}>
                          {t('global.buy')}
                        </span>
                      ) : null}
                    </Button>
                    <CollectionPublishButton collection={collection} />
                    {canSeeCollection(collection, wallet.address) ? <CollectionContextMenu collection={collection} /> : null}
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

          {this.hasItems() ? (
            <>
              <div className="search-container">
                <TextFilter
                  placeholder={t('third_party_collection_detail_page.search_placeholder', { count: total })}
                  value={searchText}
                  onChange={this.handeSearchChange}
                />

                <div className="search-info secondary-text">
                  {t('third_party_collection_detail_page.search_info', { page, pageTotal, total })}
                </div>
              </div>

              {selectedItemsCount > 0 ? (
                <div className="selection-info">
                  {t('third_party_collection_detail_page.selection', { count: selectedItemsCount })}
                  &nbsp;
                  <span className="link" onClick={this.handleClearSelection}>
                    {t('third_party_collection_detail_page.clear_selection')}
                  </span>
                  &nbsp;
                  <Info content={t('third_party_collection_detail_page.max_select_count', { count: MAX_ITEM_COUNT })} />
                </div>
              ) : null}

              <div className="collection-items">
                <Grid columns="equal" className="grid-header secondary-text">
                  <Grid.Row>
                    <Grid.Column width={5} className="item-column">
                      <Checkbox
                        className="item-checkbox"
                        checked={this.areAllSelected(paginatedItems)}
                        onClick={this.handleSelectPageChange}
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
                    selected={!!itemSelectionState[item.id]}
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
      </>
    )
  }

  render() {
    const { isLoading } = this.props
    const hasAccess = this.hasAccess()
    return (
      <LoggedInDetailPage className="ThirdPartyCollectionDetailPage" hasNavigation={!hasAccess && !isLoading} isLoading={isLoading}>
        {hasAccess ? this.renderPage() : <NotFound />}
      </LoggedInDetailPage>
    )
  }
}
