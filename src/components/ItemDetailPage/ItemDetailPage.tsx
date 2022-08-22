import * as React from 'react'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Section, Row, Narrow, Button, Dropdown, Icon, Mana, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Network } from '@dcl/schemas'
import { locations } from 'routing/locations'
import { ItemType, THUMBNAIL_PATH, WearableData } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { areEmoteMetrics } from 'modules/models/types'
import { Item } from 'modules/item/types'
import { isThirdParty } from 'lib/urn'
import { shorten } from 'lib/address'
import { getMaxSupply, getMissingBodyShapeType, isFree, resizeImage, getThumbnailURL } from 'modules/item/utils'
import { getCollectionType, isLocked as isCollectionLocked } from 'modules/collection/utils'
import { dataURLToBlob } from 'modules/media/utils'
import { computeHashes } from 'modules/deployment/contentUtils'
import ItemBadge from 'components/ItemBadge'
import Notice from 'components/Notice'
import ItemProvider from 'components/ItemProvider'
import ConfirmDelete from 'components/ConfirmDelete'
import ItemImage from 'components/ItemImage'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import NotFound from 'components/NotFound'
import Back from 'components/Back'
import { Props, State } from './ItemDetailPage.types'
import './ItemDetailPage.css'

const STORAGE_KEY = 'dcl-item-notice'

export default class ItemDetailPage extends React.PureComponent<Props, State> {
  thumbnailInput = React.createRef<HTMLInputElement>()
  handleEditItem = () => {
    const { item, onNavigate } = this.props
    onNavigate(locations.itemEditor({ itemId: item!.id, collectionId: item!.collectionId }))
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
    const { item, onOpenModal, isEmotesFeatureFlagOn } = this.props

    if (isEmotesFeatureFlagOn && item?.type === ItemType.EMOTE) {
      onOpenModal('EditThumbnailModal', { onSaveThumbnail: this.handleEmoteThumbnailChange, item })
    } else if (this.thumbnailInput.current) {
      this.thumbnailInput.current.click()
    }
  }

  handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onSaveItem, item } = this.props
    const { files } = event.target

    if (files && files.length > 0) {
      const file = files[0]
      const resizedFile = await resizeImage(file)
      const thumbnail = URL.createObjectURL(resizedFile)
      const blob = dataURLToBlob(thumbnail)
      if (blob) {
        onSaveItem(item as Item, { ...item?.contents, [THUMBNAIL_PATH]: blob })
      }
    }
  }

  renderPage(item: Item, collection: Collection | null) {
    const { onNavigate } = this.props
    const data = item.data as WearableData
    const metrics = item.metrics

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
            <div>
              <ItemImage item={item} hasBadge hasRarityBadge />
              <div>
                <Button primary onClick={this.handleOpenThumbnailDialog}>
                  <input type="file" ref={this.thumbnailInput} onChange={this.handleThumbnailChange} accept="image/png, image/jpeg" />
                  <Icon name="camera" />
                  {t('item_detail_page.edit_thumbnail')}
                </Button>
              </div>

              {areEmoteMetrics(metrics) ? (
                <div className="metrics">
                  <div className="subtitle">{t('item_detail_page.properties')}</div>
                  <div className="metric">{t('model_metrics.sequences', { count: metrics.sequences })}</div>
                  <div className="metric">{t('model_metrics.duration', { count: Number(metrics.duration.toFixed(2)) })}</div>
                  <div className="metric">{t('model_metrics.frames', { count: metrics.frames })}</div>
                  <div className="metric">{t('model_metrics.fps', { count: Number(metrics.fps.toFixed(2)) })}</div>
                </div>
              ) : (
                <div className="metrics">
                  <div className="metric">{t('model_metrics.triangles', { count: metrics.triangles })}</div>
                  <div className="metric">{t('model_metrics.materials', { count: metrics.materials })}</div>
                  <div className="metric">{t('model_metrics.textures', { count: metrics.textures })}</div>
                </div>
              )}
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
                        <CopyToClipboard text={item.urn!}>
                          <Icon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
                        </CopyToClipboard>
                      </span>
                      <div className="urn-actions">
                        {isThirdParty(item.urn) ? (
                          <span className="link" onClick={this.handleEditURN}>
                            {t('item.edit_urn')}
                          </span>
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
                  <div>
                    <Button inverted size="small" onClick={this.handleEditItem}>
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
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : null}
                  </div>
                </div>
                <div className="data">{item.description}</div>
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
                      {item.price ? <Mana network={Network.MATIC}>{ethers.utils.formatEther(item.price)}</Mana> : '-'}
                    </Section>
                  ) : null}
                  <Section>
                    <div className="subtitle">{t('item.beneficiary')}</div>
                    {item.beneficiary ? <div className="value">{shorten(item.beneficiary)}</div> : '-'}
                  </Section>
                </div>
              </div>

              {item.type === ItemType.WEARABLE ? (
                <div className="card">
                  <div className="title-card-container">
                    <div className="title">{t('item_detail_page.representations.title')}</div>
                    <Button className="edit-button" inverted size="small" onClick={this.handleEditRepresentation}>
                      {t('global.edit')}
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

              {item.data.tags.length ? (
                <div className="card">
                  <div className="title">{t('item_detail_page.tags.title')}</div>
                  <div className="data">
                    {item.data.tags.map(tag => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
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
