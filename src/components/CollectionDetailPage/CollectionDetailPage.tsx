import * as React from 'react'
import classNames from 'classnames'
import { Network } from '@dcl/schemas'
import { Section, Row, Narrow, Column, Header, Button, Popup, Tabs, Table, Label, SemanticSIZES } from 'decentraland-ui'
import { NetworkCheck } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { FromParam } from 'modules/location/types'
import {
  canMintCollectionItems,
  canSeeCollection,
  getCollectionEditorURL,
  isOnSale as isCollectionOnSale,
  isLocked as isCollectionLocked,
  isOwner
} from 'modules/collection/utils'
import { CollectionType } from 'modules/collection/types'
import { isSmart } from 'modules/item/utils'
import { Item, ItemType, SyncStatus, VIDEO_PATH } from 'modules/item/types'
import CollectionProvider from 'components/CollectionProvider'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import NotFound from 'components/NotFound'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import CollectionStatus from 'components/CollectionStatus'
import JumpIn from 'components/JumpIn'
import CollectionPublishButton from './CollectionPublishButton'
import CollectionContextMenu from './CollectionContextMenu'
import { Props, State } from './CollectionDetailPage.types'
import CollectionItem from './CollectionItem'

import './CollectionDetailPage.css'

export default class CollectionDetailPage extends React.PureComponent<Props, State> {
  state: State = {
    tab: this.props.tab || ItemType.WEARABLE
  }

  componentDidMount(): void {
    const { collection } = this.props
    if (collection) {
      this.fetchCollectionForumPostReply()
    }
  }

  componentDidUpdate(prevProps: Props): void {
    const { collection } = this.props
    if (!prevProps.collection && collection) {
      this.fetchCollectionForumPostReply()
    }
  }

  fetchCollectionForumPostReply() {
    const { collection, onFetchCollectionForumPostReply } = this.props
    // Only fetch the forum post replies if the collection has a forum link and there's no other fetch process in progress
    if (collection && collection.isPublished && !collection.isApproved && collection.forumLink) {
      onFetchCollectionForumPostReply(collection.id)
    }
  }

  handleMintItems = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('MintItemsModal', { collectionId: collection!.id })
  }

  handleNewItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CreateSingleItemModal', { collectionId: collection!.id })
  }

  handleEditName = () => {
    const { collection, onOpenModal } = this.props
    if (collection && !collection.isPublished) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }

  handleOnSaleChange = () => {
    const { collection, wallet, onOpenModal } = this.props
    if (collection) {
      onOpenModal('SellCollectionModal', { collectionId: collection.id, isOnSale: isCollectionOnSale(collection, wallet) })
    }
  }

  handleGoBack = () => {
    this.props.onNavigate(locations.collections())
  }

  hasItems(items: Item[]) {
    return items.length > 0
  }

  hasAccess() {
    const { wallet, collection } = this.props
    return wallet !== null && collection !== null && canSeeCollection(collection, wallet.address)
  }

  handleNavigateToEditor = () => {
    const { collection, items, onNavigate } = this.props
    collection && onNavigate(getCollectionEditorURL(collection, items), { fromParam: FromParam.COLLECTIONS })
  }

  handleNavigateToForum = () => {
    const { collection } = this.props
    if (collection && collection.isPublished && collection.forumLink) {
      this.navigateTo(collection.forumLink, '_blank')
    }
  }

  navigateTo = (url: string, target = '') => {
    const newWindow = window.open(url, target)
    if (newWindow) {
      newWindow.focus()
    }
  }

  handleTabChange = (tab: ItemType) => {
    const { onNavigate, collection } = this.props
    this.setState({ tab })
    onNavigate(locations.collectionDetail(collection!.id, CollectionType.STANDARD, { tab }))
  }

  renderMissingItemPricePopup(itemType: ItemType) {
    const itemTypeText = itemType === ItemType.WEARABLE ? t('collection_detail_page.wearables') : t('collection_detail_page.emotes')
    return (
      <Popup
        className="modal-tooltip"
        content={t('collection_detail_page.missing_item_price', { item_type: itemTypeText.toLowerCase() })}
        position="top center"
        trigger={<i aria-hidden="true" className="circle icon tiny"></i>}
      />
    )
  }

  renderMissingSmartWearableVideoPopup() {
    return (
      <Popup
        className="modal-tooltip"
        content={t('collection_detail_page.missing_smart_wearable_video')}
        position="top center"
        trigger={<i aria-hidden="true" className="circle icon tiny"></i>}
      />
    )
  }

  renderActionButtoms(items: Item[]) {
    const collection = this.props.collection!
    const isLocked = isCollectionLocked(collection)
    const hasItems = this.hasItems(items)

    return (
      <>
        <JumpIn size="small" active collection={collection} text={t('global.see_in_decentraland')} disabled={isLocked || !hasItems} />
        <Button basic className="action-button" disabled={isLocked || !hasItems} onClick={this.handleNavigateToEditor}>
          <BuilderIcon name="cube" />
          <span className="text">{t('collection_detail_page.preview')}</span>
        </Button>
        {hasItems && !collection.isPublished ? (
          <Button basic className="action-button add-items" disabled={isLocked} onClick={this.handleNewItem}>
            <BuilderIcon name="add-active" />
            <span className="text">{t('collection_detail_page.add_item')}</span>
          </Button>
        ) : null}
      </>
    )
  }

  renderToggleOnSaleButtom() {
    const { wallet, isOnSaleLoading } = this.props
    const collection = this.props.collection!
    const isOnSale = isCollectionOnSale(collection, wallet)

    return (
      <NetworkCheck network={Network.MATIC}>
        {isEnabled => (
          <Button
            className={classNames('action-button', isOnSale ? 'basic' : 'primary')}
            disabled={isOnSaleLoading || !isEnabled}
            onClick={this.handleOnSaleChange}
          >
            <span className="text">
              {isOnSale ? t('collection_detail_page.remove_from_marketplace') : t('collection_detail_page.put_for_sale')}
            </span>
          </Button>
        )}
      </NetworkCheck>
    )
  }

  renderForumRepliesBadge(size: SemanticSIZES = 'tiny') {
    const { collection } = this.props
    if (collection?.forumPostReply) {
      const { highest_post_number, last_read_post_number } = collection.forumPostReply
      const unreadPosts = highest_post_number - (last_read_post_number ?? 0)
      return (
        <Label className="badge-forum-unread-posts" circular size={size}>
          {unreadPosts}
        </Label>
      )
    }

    return null
  }

  renderUnsyncedCollectionNoticeStatus() {
    const { collection, status } = this.props

    if (!collection?.isApproved || ![SyncStatus.UNSYNCED, SyncStatus.UNDER_REVIEW].includes(status)) {
      return null
    }

    return (
      <div className="unsynced-collection container">
        <i className="unsynced-collection alert-icon" />
        <div className="unsynced-collection message">
          <h4 className="unsynced-collection title">{t('collection_detail_page.unsynced_collection_title')}</h4>
          <p className="unsynced-collection text">{t(`collection_detail_page.${status}_collection_message`, { br: <br /> })}</p>
        </div>
        {status === SyncStatus.UNDER_REVIEW ? (
          <Button primary onClick={this.handleNavigateToForum} className="unsynced-collection action-button">
            <span>{t('collection_context_menu.forum_post')}</span>
            {this.renderForumRepliesBadge('medium')}
          </Button>
        ) : null}
        {status === SyncStatus.UNSYNCED ? <CollectionPublishButton collection={collection} /> : null}
      </div>
    )
  }

  renderPage(items: Item[]) {
    const { tab } = this.state
    const { status, wallet } = this.props
    const collection = this.props.collection!

    const canMint = canMintCollectionItems(collection, wallet.address)
    const isLocked = isCollectionLocked(collection)
    const isOnSale = isCollectionOnSale(collection, wallet)
    const hasEmotes = items.some(item => item.type === ItemType.EMOTE)
    const hasWearables = items.some(item => item.type === ItemType.WEARABLE)
    const isEmoteMissingPrice = hasEmotes ? items.some(item => item.type === ItemType.EMOTE && !item.price) : false
    const isWearableMissingPrice = hasWearables ? items.some(item => item.type === ItemType.WEARABLE && !item.price) : false
    const isSmartWearableMissingVideo = hasWearables ? items.some(item => isSmart(item) && !(VIDEO_PATH in item.contents)) : false
    const hasOnlyEmotes = hasEmotes && !hasWearables
    const hasOnlyWearables = hasWearables && !hasEmotes
    const filteredItems = items.filter(item =>
      hasOnlyWearables ? item.type === ItemType.WEARABLE : hasOnlyEmotes ? item.type === ItemType.EMOTE : item.type === tab
    )
    const showShowTabs = hasEmotes && hasWearables

    return (
      <>
        <Section className={classNames({ 'is-published': collection.isPublished })}>
          <Row>
            <Back absolute onClick={this.handleGoBack} />
            <Narrow>
              <Row>
                <Column grow={false} className="name-container">
                  {isLocked ? (
                    <Header size="huge" className="name">
                      {collection.isPublished && <CollectionStatus collection={collection} />}
                      {collection.name}
                    </Header>
                  ) : (
                    <Row className="header-row" onClick={this.handleEditName}>
                      <Header size="huge" className="name">
                        {collection.name}
                      </Header>
                      <BuilderIcon name="edit" className="edit-collection-name" />
                      {isOnSale ? (
                        <Label className="badge-on-sale" size="small" circular>
                          {t('collection_detail_page.on_sale')}
                        </Label>
                      ) : null}
                    </Row>
                  )}
                </Column>
                <Column align="right" className="actions-container" shrink={false} grow={false}>
                  <Row className="actions">
                    {collection.isPublished && collection.isApproved ? (
                      <Popup
                        content={t('collection_detail_page.can_mint')}
                        className="CollectionDetailPage popup-mint"
                        position="top center"
                        trigger={
                          <Button basic className="action-button" disabled={!canMint} onClick={this.handleMintItems}>
                            <span className="text">{t('collection_detail_page.mint_items')}</span>
                          </Button>
                        }
                        on="hover"
                        inverted
                        flowing
                      />
                    ) : null}
                    {collection.isPublished && collection.forumLink && !collection.isApproved ? (
                      <>
                        <Button basic onClick={this.handleNavigateToForum}>
                          <span>{t('collection_context_menu.forum_post')}</span>
                        </Button>
                        {collection?.forumPostReply ? this.renderForumRepliesBadge() : null}
                      </>
                    ) : null}
                    {!(collection.isPublished && collection.isApproved) && status !== SyncStatus.UNSYNCED ? (
                      <CollectionPublishButton collection={collection} />
                    ) : null}
                    {isOwner(collection, wallet.address) && collection.isPublished && collection.isApproved
                      ? this.renderToggleOnSaleButtom()
                      : null}
                    {canSeeCollection(collection, wallet.address) ? <CollectionContextMenu collection={collection} /> : null}
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          {this.renderUnsyncedCollectionNoticeStatus()}
          {showShowTabs ? (
            <Tabs isFullscreen>
              <Tabs.Tab active={tab === ItemType.WEARABLE} onClick={() => this.handleTabChange(ItemType.WEARABLE)}>
                <BuilderIcon name="wearable" />
                {t('collection_detail_page.wearables')}
                {isWearableMissingPrice
                  ? this.renderMissingItemPricePopup(ItemType.WEARABLE)
                  : isSmartWearableMissingVideo
                  ? this.renderMissingSmartWearableVideoPopup()
                  : null}
              </Tabs.Tab>
              <Tabs.Tab active={tab === ItemType.EMOTE} onClick={() => this.handleTabChange(ItemType.EMOTE)}>
                <BuilderIcon name="emote" />
                {t('collection_detail_page.emotes')}
                {isEmoteMissingPrice ? this.renderMissingItemPricePopup(ItemType.EMOTE) : null}
              </Tabs.Tab>
              <div className="secondary-actions tab">{this.renderActionButtoms(items)}</div>
            </Tabs>
          ) : (
            <div className="secondary-actions">{this.renderActionButtoms(items)}</div>
          )}

          {this.hasItems(items) ? (
            <Table basic="very">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('collection_detail_page.table.item')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_detail_page.table.rarity')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_detail_page.table.category')}</Table.HeaderCell>
                  {tab === ItemType.EMOTE || hasOnlyEmotes ? (
                    <Table.HeaderCell>{t('collection_detail_page.table.play_mode')}</Table.HeaderCell>
                  ) : null}
                  <Table.HeaderCell>{t('collection_detail_page.table.price')}</Table.HeaderCell>
                  {collection.isPublished && collection.isApproved ? (
                    <Table.HeaderCell>{t('collection_detail_page.table.supply')}</Table.HeaderCell>
                  ) : null}
                  <Table.HeaderCell>{t('collection_detail_page.table.status')}</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredItems.map(item => (
                  <CollectionItem key={item.id} collection={collection} item={item} />
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="empty">
              <div className="sparkles" />
              <div>
                <span className="empty-collection-title">{t('collection_detail_page.add_items_title')}</span>
                <br />
                {t('collection_detail_page.add_items_subtitle')}
                <br />
                {t('collection_detail_page.cant_remove')}
                <br />
                <Button basic className="empty-action-button" disabled={isLocked} onClick={this.handleNewItem}>
                  <span className="text">{t('collection_detail_page.add_item')}</span>
                </Button>
              </div>
            </div>
          )}
        </Narrow>
      </>
    )
  }

  render() {
    const { isLoading, collection } = this.props
    const hasAccess = this.hasAccess()
    const HUGE_PAGE_SIZE = 5000 // TODO: Remove this ASAP and implement pagination
    return (
      <CollectionProvider id={collection?.id} itemsPage={1} itemsPageSize={HUGE_PAGE_SIZE}>
        {({ isLoading: isLoadingCollectionData, items }) => (
          <LoggedInDetailPage
            className="CollectionDetailPage"
            hasNavigation={!hasAccess && !isLoading && !isLoadingCollectionData}
            isLoading={isLoading || isLoadingCollectionData}
          >
            {hasAccess ? this.renderPage(items) : <NotFound />}
          </LoggedInDetailPage>
        )}
      </CollectionProvider>
    )
  }
}
