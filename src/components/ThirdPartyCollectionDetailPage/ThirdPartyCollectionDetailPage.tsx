import * as React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Grid, Section, Row, Narrow, Column, Header, Icon, Button, TextFilter, Pagination, PaginationProps } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { canSeeCollection } from 'modules/collection/utils'
import { Item } from 'modules/item/types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import CollectionContextMenu from './CollectionContextMenu'
import CollectionPublishButton from './CollectionPublishButton'
import CollectionItem from './CollectionItem'
import { Props, State } from './ThirdPartyCollectionDetailPage.types'

import './ThirdPartyCollectionDetailPage.css'

const STORAGE_KEY = 'dcl-third-party-collection-notice'
const PAGE_SIZE = 2

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
    // onOpenModal('BuySlotModal', {})
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

  handleSelectAllChange = () => {
    const items = this.search()
    const itemSelectionState: Record<string, boolean> = {}

    // Performs the opposite actoin, if everything is selected, it'll deselect and viceversa
    const isSelected = !this.isAllSelected()

    for (const item of items) {
      itemSelectionState[item.id] = isSelected
    }

    this.setState({ itemSelectionState })
  }

  hasItems() {
    const { items } = this.props
    return items.length > 0
  }

  hasAccess() {
    const { wallet, collection } = this.props
    return collection !== null && canSeeCollection(collection, wallet.address)
  }

  isAllSelected() {
    const { items } = this.props
    const { itemSelectionState } = this.state

    const selectedItems = Object.values(itemSelectionState).filter(isSelected => isSelected)
    return items.length === selectedItems.length
  }

  isSearching() {
    return this.state.searchText !== ''
  }

  search() {
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
    const { wallet } = this.props
    const { page, searchText, itemSelectionState } = this.state
    const collection = this.props.collection!

    // TODO: recover this from the collection/address
    const slots = 0

    const items = this.search()
    const paginatedItems = this.paginate(items)
    const total = items.length

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
                    <Button secondary compact className={`${slots <= 0 ? 'empty' : ''} slots`} onClick={this.handleBuySlot}>
                      {t('third_party_collection_detail_page.slots', { amount: slots })}
                      {slots <= 0 ? (
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
                  {t('third_party_collection_detail_page.search_info', { page, totalPages, total })}
                  <span className="link select-all" onClick={this.handleSelectAllChange}>
                    {this.isAllSelected()
                      ? t('third_party_collection_detail_page.deselect_all')
                      : t('third_party_collection_detail_page.select_all')}
                  </span>
                </div>
              </div>

              <div className="collection-items">
                <Grid columns="equal" className="grid-header secondary-text">
                  <Grid.Row>
                    <Grid.Column width={5}>{t('global.item')}</Grid.Column>
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
