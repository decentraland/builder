import * as React from 'react'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isThirdParty } from 'lib/urn'
import { Section, Loader, Tabs, Button, Icon, Pagination, PaginationProps, Header, Modal, Checkbox, Popup } from 'decentraland-ui'
import { Item } from 'modules/item/types'
import { hasBodyShape } from 'modules/item/utils'
import { TP_TRESHOLD_TO_REVIEW } from 'modules/collection/constants'
import { LEFT_PANEL_PAGE_SIZE } from '../../constants'
import SidebarItem from './SidebarItem'
import { Props, State, ItemPanelTabs } from './Items.types'
import './Items.css'

const INITIAL_PAGE_STATE = {
  [ItemPanelTabs.TO_REVIEW]: 1,
  [ItemPanelTabs.REVIEWED]: 1,
  [ItemPanelTabs.ALL_ITEMS]: 1
}

export default class Items extends React.PureComponent<Props, State> {
  state: State = {
    items: this.props.items,
    reviewed: [],
    currentTab: ItemPanelTabs.TO_REVIEW,
    currentPages: INITIAL_PAGE_STATE,
    reviewedTabPage: 1,
    showGetMoreSamplesModal: false,
    doNotShowSamplesModalAgain: false
  }

  componentDidMount() {
    const { items, onSetReviewedItems } = this.props
    onSetReviewedItems(items)
  }

  componentDidUpdate(prevProps: Props) {
    const { items, selectedCollectionId } = this.props
    const { currentTab } = this.state
    const prevItemIds = prevProps.items.map(prevItem => prevItem.id)
    if (currentTab === ItemPanelTabs.TO_REVIEW && items.some(item => !prevItemIds.includes(item.id))) {
      this.setState({ items })
    }
    // if selectedCollectionId changes, lets clear the items in the state
    if (selectedCollectionId !== prevProps.selectedCollectionId) {
      this.setState({ items })
    }
  }

  isVisible = (item: Item) => {
    const { visibleItems } = this.props
    return visibleItems.some(_item => _item.id === item.id)
  }

  handleClick = (item: Item) => {
    const { visibleItems, onSetItems, bodyShape } = this.props
    if (!hasBodyShape(item, bodyShape)) return

    const newVisibleItemIds = visibleItems.filter(_item => _item.id !== item.id)
    if (!this.isVisible(item)) {
      newVisibleItemIds.push(item)
    }
    onSetItems(newVisibleItemIds)
  }

  handleTabChange = (targetTab: ItemPanelTabs) => {
    const { onLoadPage } = this.props
    const { currentPages } = this.state
    if (targetTab === ItemPanelTabs.ALL_ITEMS) {
      onLoadPage(currentPages[ItemPanelTabs.ALL_ITEMS])
    }
    this.setState({ currentTab: targetTab })
  }

  handleGetRandomSampleClick = () => {
    const { doNotShowSamplesModalAgain, items } = this.state
    if (doNotShowSamplesModalAgain) {
      const { onLoadRandomPage } = this.props
      this.setState(prevState => ({ reviewed: [...prevState.reviewed, ...items] }), onLoadRandomPage)
    } else {
      this.setState({ showGetMoreSamplesModal: true })
    }
  }

  handleReviewedPageChange = (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
    this.setState({ reviewedTabPage: +props.activePage! })
  }

  handlePageChange = (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
    const { currentTab } = this.state
    const { onLoadPage } = this.props
    this.setState(prevState => ({ currentPages: { ...prevState.currentPages, [currentTab]: +props.activePage! } }))
    onLoadPage(+props.activePage!)
  }

  getIsReviewingTPItems = () => {
    const { items, isReviewing } = this.props
    return items[0] ? isThirdParty(items[0].urn) && isReviewing : false
  }

  renderSidebarItem = (item: Item) => {
    const { selectedCollectionId, selectedItemId, bodyShape } = this.props
    return (
      <SidebarItem
        key={item.id}
        item={item}
        isSelected={selectedItemId === item.id}
        isVisible={this.isVisible(item)}
        selectedCollectionId={selectedCollectionId}
        bodyShape={bodyShape}
        onClick={this.handleClick}
      />
    )
  }

  renderTabPagination = (total: number) => {
    const { currentTab, currentPages } = this.state
    const currentPage = currentPages[currentTab]
    const totalPages = Math.ceil(total / LEFT_PANEL_PAGE_SIZE)
    return totalPages > 1 ? (
      <Pagination
        siblingRange={0}
        firstItem={null}
        lastItem={null}
        totalPages={totalPages}
        activePage={currentPage}
        onPageChange={this.handlePageChange}
      />
    ) : null
  }

  renderPaginationStats = (total: number) => {
    const { currentPages, currentTab } = this.state
    const currentPage = currentPages[currentTab]
    const pageStart = (currentPage - 1) * LEFT_PANEL_PAGE_SIZE
    const pageEnd = currentPage * LEFT_PANEL_PAGE_SIZE
    return (
      <Header sub>
        {t('item_editor.left_panel.reviewed_tab.page_counter', {
          pageStart,
          pageEnd: pageEnd > total ? total : pageEnd,
          total: total
        })}
      </Header>
    )
  }

  renderTabContent = () => {
    const { items: propItems, isLoading, totalItems } = this.props
    const { items: stateItems, reviewed, currentTab, currentPages } = this.state
    const areTPItems = this.getIsReviewingTPItems()
    const currentPage = currentPages[currentTab]
    switch (currentTab) {
      case ItemPanelTabs.TO_REVIEW:
        return isLoading ? (
          <Loader size="large" active />
        ) : (
          <>
            {(areTPItems ? stateItems : propItems).map(this.renderSidebarItem)}
            {!areTPItems && totalItems ? this.renderTabPagination(totalItems) : null}
          </>
        )
      case ItemPanelTabs.REVIEWED: {
        const paginatedItems = reviewed.slice((currentPage - 1) * LEFT_PANEL_PAGE_SIZE, currentPage * LEFT_PANEL_PAGE_SIZE)
        return (
          <>
            {reviewed.length ? this.renderPaginationStats(reviewed.length) : null}
            {paginatedItems.map(this.renderSidebarItem)}
            {reviewed.length ? this.renderTabPagination(reviewed.length) : null}
          </>
        )
      }
      case ItemPanelTabs.ALL_ITEMS: {
        return isLoading ? (
          <Loader size="large" active />
        ) : (
          <>
            {propItems.length && totalItems ? this.renderPaginationStats(totalItems) : null}
            {propItems.map(this.renderSidebarItem)}
            {propItems.length && totalItems ? this.renderTabPagination(totalItems) : null}
          </>
        )
      }
      default:
        return null
    }
  }

  getThresholdToReview = () => {
    const { totalItems } = this.props
    return Math.floor(totalItems! * TP_TRESHOLD_TO_REVIEW)
  }

  renderTabHeader = () => {
    const { isLoading, totalItems } = this.props
    const { currentTab, reviewed } = this.state
    let headerInnerContent
    const notEnoughItemsToAskMore = !!totalItems && (totalItems < LEFT_PANEL_PAGE_SIZE || reviewed.length === totalItems)
    switch (currentTab) {
      case ItemPanelTabs.TO_REVIEW:
        headerInnerContent = (
          <Popup
            content={t('item_editor.top_panel.not_enough_items_to_curate_more')}
            disabled={!notEnoughItemsToAskMore}
            position="bottom center"
            trigger={
              <div>
                <Button
                  disabled={isLoading || notEnoughItemsToAskMore}
                  primary
                  className="random-sample-button"
                  onClick={this.handleGetRandomSampleClick}
                >
                  <Icon name="random" />
                  {t('item_editor.left_panel.get_random_sample')}
                </Button>
              </div>
            }
            hideOnScroll={true}
            on="hover"
            inverted
            flowing
          />
        )
        break
      case ItemPanelTabs.REVIEWED:
        headerInnerContent = (
          <T
            id="item_editor.left_panel.reviewed_samples"
            values={{
              reviewed_samples_bold: <b>{t('item_editor.left_panel.reviewed_samples_bold', { count: reviewed.length })}</b>,
              total: this.getThresholdToReview()
            }}
          />
        )
        break
      default:
        return null
    }
    return <div className="tab-header"> {headerInnerContent} </div>
  }

  renderModal = () => {
    const { onLoadRandomPage } = this.props
    const { showGetMoreSamplesModal, doNotShowSamplesModalAgain, items } = this.state
    return (
      <Modal open={showGetMoreSamplesModal} size="small" className="ConfirmNewSampleModal">
        <Modal.Header>{t('item_editor.left_panel.get_more_samples_modal.title')}</Modal.Header>
        <Modal.Content>
          <T
            id="item_editor.left_panel.get_more_samples_modal.content"
            values={{
              count: 10,
              tabName: <b>{ItemPanelTabs.REVIEWED}</b>
            }}
          />
          <div
            className="checkbox-container"
            onClick={() => this.setState(prevState => ({ doNotShowSamplesModalAgain: !prevState.doNotShowSamplesModalAgain }))}
          >
            <Checkbox checked={doNotShowSamplesModalAgain} />
            {t('item_editor.left_panel.get_more_samples_modal.dont_show_again')}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => this.setState({ showGetMoreSamplesModal: false })}>{t('global.cancel')}</Button>
          <Button
            primary
            onClick={() =>
              this.setState(
                prevState => ({ showGetMoreSamplesModal: false, reviewed: [...prevState.reviewed, ...items] }),
                onLoadRandomPage
              )
            }
          >
            {t('item_editor.left_panel.get_more_samples_modal.understood')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  // the tabs will be just rendered for the TP items being reviewed
  renderTabs = () => {
    const { currentTab } = this.state
    return (
      <Tabs isFullscreen>
        <Tabs.Tab active={currentTab === ItemPanelTabs.TO_REVIEW} onClick={() => this.handleTabChange(ItemPanelTabs.TO_REVIEW)}>
          {t('item_editor.left_panel.to_review')}
        </Tabs.Tab>
        <Tabs.Tab active={currentTab === ItemPanelTabs.REVIEWED} onClick={() => this.handleTabChange(ItemPanelTabs.REVIEWED)}>
          {t('item_editor.left_panel.reviewed')}
        </Tabs.Tab>
        <Tabs.Tab active={currentTab === ItemPanelTabs.ALL_ITEMS} onClick={() => this.handleTabChange(ItemPanelTabs.ALL_ITEMS)}>
          {t('item_editor.left_panel.all_items')}
        </Tabs.Tab>
      </Tabs>
    )
  }

  render() {
    const { items } = this.state
    const { totalItems, isLoading } = this.props
    if ((items.length === 0 || !totalItems) && isLoading) return <Loader active size="large" />

    return (
      <Section className="Items">
        {this.getIsReviewingTPItems() ? (
          <>
            {this.renderTabs()}
            {this.renderTabHeader()}
          </>
        ) : null}
        {this.renderTabContent()}
        {this.renderModal()}
      </Section>
    )
  }
}
