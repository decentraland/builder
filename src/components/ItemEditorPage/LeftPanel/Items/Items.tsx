import * as React from 'react'
import equal from 'fast-deep-equal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import {
  Section,
  Loader,
  Tabs,
  Button,
  Icon as DCLIcon,
  Pagination,
  PaginationProps,
  Header,
  Modal,
  Checkbox,
  Popup
} from 'decentraland-ui'
import { extractThirdPartyTokenId, extractTokenId, isThirdParty } from 'lib/urn'
import { Item, ItemType } from 'modules/item/types'
import { hasBodyShape, isEmote, isWearable } from 'modules/item/utils'
import { getTPThresholdToReview } from 'modules/collection/utils'
import { LEFT_PANEL_PAGE_SIZE } from '../../constants'
import Collapsable from 'components/Collapsable'
import Icon from 'components/Icon'
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
    currentTab: ItemPanelTabs.TO_REVIEW,
    currentPages: INITIAL_PAGE_STATE,
    reviewedTabPage: 1,
    showGetMoreSamplesModal: false,
    showAllItemsTabChangeModal: false
  }

  analytics = getAnalytics()

  componentDidUpdate(prevProps: Props) {
    const { items, onReviewItems } = this.props
    const { currentTab } = this.state

    if (this.getIsReviewingTPItems() && currentTab === ItemPanelTabs.TO_REVIEW && !equal(items, prevProps.items)) {
      onReviewItems()
    }
  }

  isVisible = (item: Item) => {
    const { visibleItems } = this.props
    return visibleItems.some(_item => _item.id === item.id)
  }

  handleClick = (item: Item) => {
    const { bodyShape, visibleItems, wearableController, isPlayingEmote, onSetItems } = this.props
    if (!hasBodyShape(item, bodyShape)) return

    let newVisibleItemIds = visibleItems.filter(_item => _item.id !== item.id)

    if (isEmote(item)) {
      if (this.isVisible(item)) {
        if (isPlayingEmote) {
          wearableController?.emote.pause() as void
        } else {
          wearableController?.emote.play() as void
        }

        return
      } else {
        newVisibleItemIds = newVisibleItemIds.filter(_item => _item.type !== ItemType.EMOTE)
      }
    }

    if (!this.isVisible(item)) {
      newVisibleItemIds.push(item)
      this.analytics.track('Preview Item', {
        ITEM_ID: item?.urn ? (isThirdParty(item.urn) ? extractThirdPartyTokenId(item.urn) : extractTokenId(item.urn)) : null,
        ITEM_TYPE: item.type,
        ITEM_NAME: item.name,
        ITEM_IS_THIRD_PARTY: isThirdParty(item.urn)
      })
    }

    onSetItems(newVisibleItemIds)
  }

  handleTabChange = (targetTab: ItemPanelTabs) => {
    const { onLoadPage, onResetReviewedItems } = this.props
    const { currentPages, currentTab } = this.state

    if (targetTab === ItemPanelTabs.ALL_ITEMS) {
      this.setState({ showAllItemsTabChangeModal: false }, () => onLoadPage(currentPages[ItemPanelTabs.ALL_ITEMS]))
    } else if (targetTab === ItemPanelTabs.TO_REVIEW && currentTab === ItemPanelTabs.ALL_ITEMS) {
      onResetReviewedItems()
      onLoadPage(1)
    }
    this.setState({ currentTab: targetTab })
  }

  handleGetRandomSampleClick = () => {
    const { showSamplesModalAgain, onReviewItems } = this.props
    if (!showSamplesModalAgain) {
      onReviewItems()
    } else {
      this.setState({ showGetMoreSamplesModal: true })
    }
  }

  handleModalProceed = () => {
    const { onReviewItems } = this.props
    onReviewItems()
    this.setState({ showGetMoreSamplesModal: false })
  }

  handlePageChange = (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
    const { currentTab } = this.state
    const { onLoadPage } = this.props
    this.setState(prevState => ({ currentPages: { ...prevState.currentPages, [currentTab]: +props.activePage! } }))
    if (currentTab !== ItemPanelTabs.REVIEWED) {
      onLoadPage(+props.activePage!)
    }
  }

  handleSwitchToAllItemsTab = () => {
    const { reviewedItems } = this.props
    if (reviewedItems.length > 0) {
      this.setState({ showAllItemsTabChangeModal: true })
    } else {
      this.handleTabChange(ItemPanelTabs.ALL_ITEMS)
    }
  }

  getIsReviewingTPItems = () => {
    const { collection, isReviewing } = this.props
    return collection ? isThirdParty(collection.urn) && isReviewing : false
  }

  renderSidebarItem = (item: Item) => {
    const { collection, selectedItemId, bodyShape, isPlayingEmote } = this.props
    return (
      <SidebarItem
        key={item.id}
        item={item}
        isSelected={selectedItemId === item.id}
        isVisible={this.isVisible(item)}
        isPlayingEmote={isPlayingEmote}
        selectedCollectionId={collection?.id ?? null}
        bodyShape={bodyShape}
        onClick={this.handleClick}
      />
    )
  }

  renderCollapsableLabel(itemType: ItemType) {
    return (
      <>
        <Icon name={itemType} />
        <T id={`item_editor.left_panel.${itemType}`} />
      </>
    )
  }

  renderSidebarCategory = (items: Item[]) => {
    const wearableItems = items.filter(isWearable)
    const emoteItems = items.filter(isEmote)

    if (items.length === 0) {
      return (
        <div className="empty">
          <div className="subtitle">{t('item_editor.left_panel.empty_collection')}</div>
        </div>
      )
    }

    if (wearableItems.length === 0 || emoteItems.length === 0) {
      return items.map(this.renderSidebarItem)
    } else {
      return (
        <>
          <Collapsable label={this.renderCollapsableLabel(ItemType.WEARABLE)}>{wearableItems.map(this.renderSidebarItem)}</Collapsable>
          <Collapsable label={this.renderCollapsableLabel(ItemType.EMOTE)}>{emoteItems.map(this.renderSidebarItem)}</Collapsable>
        </>
      )
    }
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
    const { items: propItems, isLoading, totalItems, reviewedItems } = this.props
    const { currentTab, currentPages } = this.state
    const areTPItems = this.getIsReviewingTPItems()
    const currentPage = currentPages[currentTab]

    if (isLoading) {
      return <Loader size="large" active />
    }

    switch (currentTab) {
      case ItemPanelTabs.TO_REVIEW:
        return (
          <>
            {this.renderSidebarCategory(propItems)}
            {!areTPItems && totalItems ? this.renderTabPagination(totalItems) : null}
          </>
        )
      case ItemPanelTabs.REVIEWED: {
        const paginatedItems = reviewedItems.slice((currentPage - 1) * LEFT_PANEL_PAGE_SIZE, currentPage * LEFT_PANEL_PAGE_SIZE)
        return (
          <>
            {reviewedItems.length ? this.renderPaginationStats(reviewedItems.length) : null}
            {this.renderSidebarCategory(paginatedItems)}
            {reviewedItems.length ? this.renderTabPagination(reviewedItems.length) : null}
          </>
        )
      }
      case ItemPanelTabs.ALL_ITEMS: {
        return (
          <>
            {propItems.length && totalItems ? this.renderPaginationStats(totalItems) : null}
            {this.renderSidebarCategory(propItems)}
            {propItems.length && totalItems ? this.renderTabPagination(totalItems) : null}
          </>
        )
      }
      default:
        return null
    }
  }

  renderTabHeader = () => {
    const { isLoading, totalItems, reviewedItems } = this.props
    const { currentTab } = this.state
    let headerInnerContent
    const notEnoughItemsToAskMore = !!totalItems && (totalItems < LEFT_PANEL_PAGE_SIZE || reviewedItems.length === totalItems)

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
                  <DCLIcon name="random" />
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
              reviewed_samples_bold: <b>{t('item_editor.left_panel.reviewed_samples_bold', { count: reviewedItems.length })}</b>,
              total: getTPThresholdToReview(totalItems ?? 1)
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
    const { onToggleShowSamplesModalAgain, showSamplesModalAgain } = this.props
    const { showGetMoreSamplesModal } = this.state
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
          <div className="checkbox-container" onClick={onToggleShowSamplesModalAgain}>
            <Checkbox checked={!showSamplesModalAgain} />
            {t('item_editor.left_panel.get_more_samples_modal.dont_show_again')}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => this.setState({ showGetMoreSamplesModal: false })}>{t('global.cancel')}</Button>
          <Button primary onClick={this.handleModalProceed}>
            {t('item_editor.left_panel.get_more_samples_modal.understood')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  renderAllItemsTabChangeModal = () => {
    const { showAllItemsTabChangeModal } = this.state

    return (
      <Modal open={showAllItemsTabChangeModal} size="small" className="ConfirmNewSampleModal">
        <Modal.Header>{t('item_editor.left_panel.all_items_check.title')}</Modal.Header>
        <Modal.Content>{t('item_editor.left_panel.all_items_check.content')}</Modal.Content>
        <Modal.Actions>
          <Button onClick={() => this.setState({ showAllItemsTabChangeModal: false })}>{t('global.cancel')}</Button>
          <Button primary onClick={() => this.handleTabChange(ItemPanelTabs.ALL_ITEMS)}>
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
        <Tabs.Tab active={currentTab === ItemPanelTabs.ALL_ITEMS} onClick={this.handleSwitchToAllItemsTab}>
          {t('item_editor.left_panel.all_items')}
        </Tabs.Tab>
      </Tabs>
    )
  }

  render() {
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
        {this.renderAllItemsTabChangeModal()}
      </Section>
    )
  }
}
