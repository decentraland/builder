import * as React from 'react'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'
import { Section, Row, Narrow, Button, Dropdown, Icon, Mana, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Network } from '@dcl/schemas'

import { locations } from 'routing/locations'
import { getMaxSupply, getMissingBodyShapeType, isFree, resizeImage, getThumbnailURL, isSmart } from 'modules/item/utils'
import { getCollectionType, isLocked as isCollectionLocked } from 'modules/collection/utils'
import { dataURLToBlob } from 'modules/media/utils'
import { computeHashes } from 'modules/deployment/contentUtils'
import { FromParam } from 'modules/location/types'
import { ItemType, SyncStatus, THUMBNAIL_PATH, VIDEO_PATH } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { isThirdParty } from 'lib/urn'
import { shorten } from 'lib/address'
import ItemBadge from 'components/ItemBadge'
import Notice from 'components/Notice'
import ItemProvider from 'components/ItemProvider'
import ConfirmDelete from 'components/ConfirmDelete'
import ItemImage from 'components/ItemImage'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import NotFound from 'components/NotFound'
import Back from 'components/Back'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import ItemVideo from 'components/ItemVideo'
import ItemProperties from 'components/ItemProperties'
import VideoMetrics from 'components/ItemVideo/VideoMetrics'
import ItemRequiredPermission from 'components/ItemRequiredPermission'
import { Props, State } from './ItemDetailPage.types'
import './ItemDetailPage.css'

const STORAGE_KEY = 'dcl-item-notice'

export default class ItemDetailPage extends React.PureComponent<Props, State> {
  thumbnailInput = React.createRef<HTMLInputElement>()

  handlePreviewItem = () => {
    const { item, onNavigate } = this.props
    item &&
      onNavigate(locations.itemEditor({ itemId: item.id, collectionId: item.collectionId }), {
        fromParam: isThirdParty(item.urn) ? FromParam.TP_COLLECTIONS : FromParam.COLLECTIONS
      })
  }

  handleEditItemVideo = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('EditVideoModal', { item, onSaveVideo: this.handleSaveVideo })
  }

  handleSaveVideo = async (video: Blob) => {
    const { item, status, onSaveItem } = this.props
    const videoComputedHash = await computeHashes({ [VIDEO_PATH]: video })
    const updatedItem = {
      ...item,
      contents: { ...item?.contents, [VIDEO_PATH]: videoComputedHash[VIDEO_PATH] }
    } as Item

    if (status && [SyncStatus.UNPUBLISHED, SyncStatus.UNDER_REVIEW].includes(status)) {
      updatedItem.video = videoComputedHash[VIDEO_PATH]
    }

    onSaveItem(updatedItem, {
      [VIDEO_PATH]: video
    })
  }

  handleDeleteItem = () => {
    const { item, onDelete } = this.props
    onDelete(item!)
  }

  handleEditRepresentation = () => {
    const { item, onOpenModal } = this.props
    if (item && getMissingBodyShapeType(item)) {
      onOpenModal('CreateSingleItemModal', { item, addRepresentation: true })
    } else {
      onOpenModal('CreateSingleItemModal', { item, changeItemFile: true })
    }
  }

  handleEditURN = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('EditItemURNModal', { item })
  }

  handleEmoteThumbnailChange = async (thumbnail: string) => {
    const { onSaveItem, item } = this.props
    const blob = dataURLToBlob(thumbnail)!
    onSaveItem({ ...item, contents: { ...item?.contents, ...(await computeHashes({ [THUMBNAIL_PATH]: blob })) } } as Item, {
      [THUMBNAIL_PATH]: blob
    })
  }

  handleOpenThumbnailDialog = () => {
    const { collection, item, onOpenModal } = this.props

    if (item?.type === ItemType.EMOTE) {
      onOpenModal('EditThumbnailModal', { onSaveThumbnail: this.handleEmoteThumbnailChange, item, collection })
    } else if (this.thumbnailInput.current) {
      this.thumbnailInput.current.click()
    }
  }

  handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onSaveItem, item } = this.props
    const { files } = event.target

    if (files && files.length > 0) {
      const file = files[0]
      const blob = await resizeImage(file, 1024, 1024)
      if (blob && item) {
        item.contents = {
          ...item.contents,
          ...(await computeHashes({ [THUMBNAIL_PATH]: blob }))
        }
        onSaveItem(item, { [THUMBNAIL_PATH]: blob })
      }
    }
  }

  handleMoveToCollection = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('MoveItemToCollectionModal', { item })
  }

  renderPage(item: Item, collection: Collection | null) {
    const { onNavigate } = this.props
    const data = item.data
    const isLocked = collection && isCollectionLocked(collection)
    const hasActions = !isLocked

    return (
      <>
        <Section>
          <Row>
            <Back onClick={() => onNavigate(locations.collectionDetail(item.collectionId))} />
          </Row>
        </Section>
        <Narrow>
          {!collection && !item.collectionId ? <Notice storageKey={STORAGE_KEY}>{t('item_detail_page.notice')}</Notice> : null}

          <div className="item-data">
            <div className="item-data-left-panel">
              <ItemImage item={item} hasBadge hasRarityBadge />
              <div>
                <Button primary onClick={this.handleOpenThumbnailDialog}>
                  <input type="file" ref={this.thumbnailInput} onChange={this.handleThumbnailChange} accept="image/png" />
                  <Icon name="camera" />
                  {t('item_detail_page.edit_thumbnail')}
                </Button>
              </div>
              <div className="metrics">
                <span className="subtitle">{t('item_detail_page.properties')}</span>
                <ItemProperties item={item} />
              </div>
              {isSmart(item) ? (
                <ItemVideo item={item} onClick={this.handleEditItemVideo}>
                  {(_video, duration, size, _isLoading) => (
                    <>
                      <div className="overlay">
                        <Icon name="play" className="play-video-button" onClick={this.handleEditItemVideo} />
                      </div>
                      <Button primary onClick={this.handleEditItemVideo}>
                        <Icon name="video" />
                        {t('item_detail_page.edit_video')}
                      </Button>
                      <div className="metrics">
                        <div className="subtitle">{t('item_detail_page.properties')}</div>
                        <VideoMetrics duration={duration} size={size} showIcons={false} />
                      </div>
                    </>
                  )}
                </ItemVideo>
              ) : null}
              <div className="details">
                <div className="subtitle">{t('item_detail_page.details')}</div>
                {item.isPublished && (
                  <div>
                    <div className="subtitle">{t('item_detail_page.details_info.id')}</div>
                    <div className="value">#{item.tokenId}</div>
                  </div>
                )}
                {data.category ? (
                  <div>
                    <div className="subtitle">{t('item.category')}</div>
                    <div className="value">{t(`${item.type}.category.${data.category}`)}</div>
                  </div>
                ) : null}
                {item.isPublished && item.rarity ? (
                  <div>
                    <div className="subtitle">{t('item.supply')}</div>
                    <div className="value">
                      {item.totalSupply}/{getMaxSupply(item)}
                    </div>
                  </div>
                ) : null}
                {collection ? (
                  <div>
                    <div className="subtitle">{t('item.collection')}</div>
                    <Link className="collection-link" to={locations.collectionDetail(collection.id, getCollectionType(collection))}>
                      {collection.name}
                    </Link>
                  </div>
                ) : null}
                {item.urn ? (
                  <div>
                    <div className="subtitle">{t('global.urn')}</div>
                    <div className="value urn">
                      <span>
                        {item.urn}
                        <CopyToClipboard role="button" text={item.urn}>
                          <Icon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
                        </CopyToClipboard>
                      </span>
                      <div className="urn-actions">
                        {isThirdParty(item.urn) ? (
                          <Popup
                            content={t('collection_item.cannot_edit_urn')}
                            disabled={!item.isPublished}
                            position="top center"
                            trigger={
                              <div>
                                <button disabled={item.isPublished} className="link" onClick={this.handleEditURN}>
                                  {t('item.edit_urn')}
                                </button>
                              </div>
                            }
                            hideOnScroll={true}
                            on="hover"
                            inverted
                            flowing
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="cards-container">
              <div className="card">
                <div className="title-card-container">
                  <div className="title">{item.name}</div>
                  <div className="actions">
                    {isSmart(item) && (
                      <Button className="edit" inverted size="small" onClick={this.handleEditRepresentation}>
                        {t('global.edit')}
                      </Button>
                    )}
                    <Button inverted size="small" onClick={this.handlePreviewItem}>
                      {t('collection_detail_page.preview')}
                    </Button>
                    {hasActions ? (
                      <Dropdown
                        trigger={
                          <Button basic className="more-actions-button">
                            <Icon name="ellipsis horizontal" />
                          </Button>
                        }
                        inline
                        direction="left"
                      >
                        <Dropdown.Menu>
                          <ConfirmDelete
                            name={item.name}
                            onDelete={this.handleDeleteItem}
                            trigger={
                              item.isPublished ? (
                                <Popup
                                  content={t('item_detail_page.delete_published_item')}
                                  position="right center"
                                  trigger={<Dropdown.Item disabled text={t('global.delete')} />}
                                  hideOnScroll={true}
                                  on="hover"
                                  inverted
                                  flowing
                                />
                              ) : (
                                <Dropdown.Item text={t('global.delete')} />
                              )
                            }
                          />
                          {!item.collectionId && (
                            <Dropdown.Item text={t('collection_item.move_to_another_collection')} onClick={this.handleMoveToCollection} />
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : null}
                  </div>
                </div>
                {item.description && (
                  <>
                    <div className="subtitle">{t('global.description')}</div>
                    <div className="data">{item.description}</div>
                  </>
                )}
                {item.data.tags.length ? (
                  <>
                    <div className="subtitle">{t('item_detail_page.tags.title')}</div>
                    <div className="data tags-container">
                      {item.data.tags.map(tag => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="card">
                <div className="title">{t('item_detail_page.selling.title')}</div>
                <div className="data">
                  {isFree(item) ? (
                    <Section>
                      <div className="subtitle">{t('item.price')}</div>
                      <div className="value">{t('global.free')}</div>
                    </Section>
                  ) : item.price ? (
                    <Section>
                      <div className="subtitle">{t('item.price')}</div>
                      {item.price ? (
                        <Mana showTooltip network={Network.MATIC}>
                          {ethers.utils.formatEther(item.price)}
                        </Mana>
                      ) : (
                        '-'
                      )}
                    </Section>
                  ) : null}
                  <Section>
                    <div className="subtitle">{t('item.beneficiary')}</div>
                    {item.beneficiary ? <div className="value">{shorten(item.beneficiary)}</div> : '-'}
                  </Section>
                </div>
              </div>

              {item.type === ItemType.WEARABLE && !isSmart(item) ? (
                <div className="card">
                  <div className="title-card-container">
                    <div className="title">{t('item_detail_page.representations.title')}</div>
                    <Button className="edit-button" inverted size="small" onClick={this.handleEditRepresentation}>
                      {getMissingBodyShapeType(item) ? t('global.add') : t('global.edit')}
                    </Button>
                  </div>
                  <div className="data">
                    <div className="representations-container">
                      {item.data.representations.map(representation => (
                        <div key={representation.mainFile} className="representation">
                          <img className="item-image" src={getThumbnailURL(item)} alt={item.name} />
                          {representation.mainFile}
                          {<ItemBadge item={item} bodyShape={representation.bodyShapes[0]} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {isSmart(item) && item.data.requiredPermissions?.length ? (
                <div className="card">
                  <div className="title-card-container">
                    <div className="title">{t('item_detail_page.required_permissions')}</div>
                    <Button
                      inverted
                      className="learn-more-permissions"
                      size="small"
                      href="https://docs.decentraland.org/creator/development-guide/sdk7/scene-metadata/#required-permissions"
                      rel="noopener noreferrer"
                      target="_blank"
                      content={t('global.learn_more')}
                    />
                  </div>
                  <div className="data">
                    <ItemRequiredPermission requiredPermissions={item.data.requiredPermissions} basic />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Narrow>
      </>
    )
  }

  render() {
    const { itemId, isLoading, hasAccess } = this.props
    return (
      <ItemProvider id={itemId}>
        {(item, collection, isLoadingItem) => (
          <LoggedInDetailPage className="ItemDetailPage" hasNavigation={!hasAccess && !isLoading} isLoading={isLoading || isLoadingItem}>
            {hasAccess && item ? this.renderPage(item, collection) : <NotFound />}
          </LoggedInDetailPage>
        )}
      </ItemProvider>
    )
  }
}
