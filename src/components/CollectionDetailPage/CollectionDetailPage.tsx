import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { useHistory, useLocation } from 'react-router-dom'
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
import { Props } from './CollectionDetailPage.types'
import CollectionItem from './CollectionItem'

import './CollectionDetailPage.css'

export default function CollectionDetailPage({
  collection,
  wallet,
  items,
  isOnSaleLoading,
  status,
  onOpenModal,
  isLoading,
  onFetchCollectionForumPostReply
}: Props) {
  const location = useLocation()
  const initialTab = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('tab') as ItemType
  }, [location])

  const [tab, setTab] = useState<ItemType>(initialTab || ItemType.WEARABLE)
  const history = useHistory()

  const fetchCollectionForumPostReply = useCallback(() => {
    // Only fetch the forum post replies if the collection has a forum link and there's no other fetch process in progress
    if (collection && collection.isPublished && !collection.isApproved && collection.forumLink) {
      onFetchCollectionForumPostReply(collection.id)
    }
  }, [collection, onFetchCollectionForumPostReply])

  useEffect(() => {
    if (collection) {
      fetchCollectionForumPostReply()
    }
  }, [collection])

  const handleMintItems = useCallback(() => {
    onOpenModal('MintItemsModal', { collectionId: collection!.id })
  }, [collection, onOpenModal])

  const handleNewItem = useCallback(() => {
    onOpenModal('CreateSingleItemModal', { collectionId: collection!.id })
  }, [collection, onOpenModal])

  const handleEditName = useCallback(() => {
    if (collection && !collection.isPublished) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }, [collection, onOpenModal])

  const handleOnSaleChange = useCallback(() => {
    if (collection) {
      onOpenModal('SellCollectionModal', { collectionId: collection.id, isOnSale: isCollectionOnSale(collection, wallet) })
    }
  }, [collection, wallet, onOpenModal])

  const handleGoBack = useCallback(() => {
    history.push(locations.collections())
  }, [history])

  const handleNavigateToEditor = useCallback(() => {
    if (collection) {
      history.push(getCollectionEditorURL(collection, items), { fromParam: FromParam.COLLECTIONS })
    }
  }, [history, collection, items])

  const navigateTo = useCallback((url: string, target = '') => {
    const newWindow = window.open(url, target)
    if (newWindow) {
      newWindow.focus()
    }
  }, [])

  const handleNavigateToForum = useCallback(() => {
    if (collection && collection.isPublished && collection.forumLink) {
      navigateTo(collection.forumLink, '_blank')
    }
  }, [collection])

  const handleTabChange = useCallback(
    (newTab: ItemType) => {
      setTab(newTab)
      history.push(locations.collectionDetail(collection!.id, CollectionType.STANDARD, { tab: tab }))
    },
    [collection, history]
  )

  const renderMissingItemPricePopup = useCallback((itemType: ItemType) => {
    const itemTypeText = itemType === ItemType.WEARABLE ? t('collection_detail_page.wearables') : t('collection_detail_page.emotes')
    return (
      <Popup
        className="modal-tooltip"
        content={t('collection_detail_page.missing_item_price', { item_type: itemTypeText.toLowerCase() })}
        position="top center"
        trigger={<i aria-hidden="true" className="circle icon tiny"></i>}
      />
    )
  }, [])

  const renderMissingSmartWearableVideoPopup = useCallback(() => {
    return (
      <Popup
        className="modal-tooltip"
        content={t('collection_detail_page.missing_smart_wearable_video')}
        position="top center"
        trigger={<i aria-hidden="true" className="circle icon tiny"></i>}
      />
    )
  }, [])

  const renderActionButtons = useCallback(
    (items: Item[]) => {
      if (!collection) {
        return null
      }

      const isLocked = isCollectionLocked(collection)
      const hasItems = items.length > 0

      return (
        <>
          <JumpIn size="small" active collection={collection} text={t('global.see_in_decentraland')} disabled={isLocked || !hasItems} />
          <Button basic className="action-button" disabled={isLocked || !hasItems} onClick={handleNavigateToEditor}>
            <BuilderIcon name="cube" />
            <span className="text">{t('collection_detail_page.preview')}</span>
          </Button>
          {hasItems && !collection.isPublished ? (
            <Button basic className="action-button add-items" disabled={isLocked} onClick={handleNewItem}>
              <BuilderIcon name="add-active" />
              <span className="text">{t('collection_detail_page.add_item')}</span>
            </Button>
          ) : null}
        </>
      )
    },
    [collection, handleNavigateToEditor, handleNewItem]
  )

  const renderToggleOnSaleButtom = useCallback(() => {
    if (!collection) {
      return null
    }

    const isOnSale = isCollectionOnSale(collection, wallet)

    return (
      <NetworkCheck network={Network.MATIC}>
        {isEnabled => (
          <Button
            className={classNames('action-button', isOnSale ? 'basic' : 'primary')}
            disabled={isOnSaleLoading || !isEnabled}
            onClick={handleOnSaleChange}
          >
            <span className="text">
              {isOnSale ? t('collection_detail_page.remove_from_marketplace') : t('collection_detail_page.put_for_sale')}
            </span>
          </Button>
        )}
      </NetworkCheck>
    )
  }, [collection, handleOnSaleChange])

  const renderForumRepliesBadge = useCallback(
    (size: SemanticSIZES = 'tiny') => {
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
    },
    [collection]
  )

  const renderUnsyncedCollectionNoticeStatus = useCallback(() => {
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
          <Button primary onClick={handleNavigateToForum} className="unsynced-collection action-button">
            <span>{t('collection_context_menu.forum_post')}</span>
            {renderForumRepliesBadge('medium')}
          </Button>
        ) : null}
        {status === SyncStatus.UNSYNCED ? <CollectionPublishButton collection={collection} /> : null}
      </div>
    )
  }, [collection, status, renderForumRepliesBadge, handleNavigateToForum])

  const renderPage = useCallback(
    (items: Item[]) => {
      if (!collection) {
        return null
      }

      const canMint = canMintCollectionItems(collection, wallet.address)
      const isLocked = isCollectionLocked(collection)
      const isOnSale = isCollectionOnSale(collection, wallet)
      const hasEmotes = items.some(item => item.type === ItemType.EMOTE)
      const hasWearables = items.some(item => item.type === ItemType.WEARABLE)
      const isEmoteMissingPrice = hasEmotes ? items.some(item => item.type === ItemType.EMOTE && !item.price) : false
      const isWearableMissingPrice = hasWearables ? items.some(item => item.type === ItemType.WEARABLE && !item.price) : false
      const isSmartWearableMissingVideo = hasWearables && items.some(item => isSmart(item) && !(VIDEO_PATH in item.contents))
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
              <Back absolute onClick={handleGoBack} />
              <Narrow>
                <Row>
                  <Column grow={false} className="name-container">
                    {isLocked ? (
                      <Header size="huge" className="name">
                        {collection.isPublished && <CollectionStatus collection={collection} />}
                        {collection.name}
                      </Header>
                    ) : (
                      <Row className="header-row" onClick={handleEditName}>
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
                            <Button basic className="action-button" disabled={!canMint} onClick={handleMintItems}>
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
                          <Button basic onClick={handleNavigateToForum}>
                            <span>{t('collection_context_menu.forum_post')}</span>
                          </Button>
                          {collection?.forumPostReply ? renderForumRepliesBadge() : null}
                        </>
                      ) : null}
                      {!(collection.isPublished && collection.isApproved) && status !== SyncStatus.UNSYNCED ? (
                        <CollectionPublishButton collection={collection} />
                      ) : null}
                      {isOwner(collection, wallet.address) && collection.isPublished && collection.isApproved
                        ? renderToggleOnSaleButtom()
                        : null}
                      {canSeeCollection(collection, wallet.address) ? <CollectionContextMenu collection={collection} /> : null}
                    </Row>
                  </Column>
                </Row>
              </Narrow>
            </Row>
          </Section>
          <Narrow>
            {renderUnsyncedCollectionNoticeStatus()}
            {showShowTabs ? (
              <Tabs isFullscreen>
                <Tabs.Tab active={tab === ItemType.WEARABLE} onClick={() => handleTabChange(ItemType.WEARABLE)}>
                  <BuilderIcon name="wearable" />
                  {t('collection_detail_page.wearables')}
                  {isWearableMissingPrice
                    ? renderMissingItemPricePopup(ItemType.WEARABLE)
                    : isSmartWearableMissingVideo
                    ? renderMissingSmartWearableVideoPopup()
                    : null}
                </Tabs.Tab>
                <Tabs.Tab active={tab === ItemType.EMOTE} onClick={() => handleTabChange(ItemType.EMOTE)}>
                  <BuilderIcon name="emote" />
                  {t('collection_detail_page.emotes')}
                  {isEmoteMissingPrice ? renderMissingItemPricePopup(ItemType.EMOTE) : null}
                </Tabs.Tab>
                <div className="secondary-actions tab">{renderActionButtons(items)}</div>
              </Tabs>
            ) : (
              <div className="secondary-actions">{renderActionButtons(items)}</div>
            )}

            {items.length > 0 ? (
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
                  <Button basic className="empty-action-button" disabled={isLocked} onClick={handleNewItem}>
                    <span className="text">{t('collection_detail_page.add_item')}</span>
                  </Button>
                </div>
              </div>
            )}
          </Narrow>
        </>
      )
    },
    [
      tab,
      status,
      wallet,
      collection,
      handleNewItem,
      renderActionButtons,
      handleEditName,
      renderMissingItemPricePopup,
      handleTabChange,
      renderUnsyncedCollectionNoticeStatus,
      renderToggleOnSaleButtom,
      handleTabChange,
      handleNavigateToForum,
      renderMissingSmartWearableVideoPopup,
      renderForumRepliesBadge,
      handleMintItems,
      handleGoBack
    ]
  )

  const hasAccess = wallet !== null && collection !== null && canSeeCollection(collection, wallet.address)
  const HUGE_PAGE_SIZE = 5000 // TODO: Remove this ASAP and implement pagination
  return (
    <CollectionProvider id={collection?.id} itemsPage={1} itemsPageSize={HUGE_PAGE_SIZE}>
      {({ isLoading: isLoadingCollectionData, items }) => (
        <LoggedInDetailPage
          className="CollectionDetailPage"
          hasNavigation={!hasAccess && !isLoading && !isLoadingCollectionData}
          isLoading={isLoading || isLoadingCollectionData}
        >
          {hasAccess ? renderPage(items) : <NotFound />}
        </LoggedInDetailPage>
      )}
    </CollectionProvider>
  )
}
