import * as React from 'react'
import equal from 'fast-deep-equal'
import { Loader, Dropdown, Button } from 'decentraland-ui'
import { BodyPartCategory, EmoteCategory, Rarity, EmoteDataADR74, HideableWearableCategory, Network, WearableCategory } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { isThirdParty } from 'lib/urn'
import {
  getMissingBodyShapeType,
  getWearableCategories,
  isOwner,
  resizeImage,
  getEmoteCategories,
  getEmotePlayModes,
  getHideableBodyPartCategories,
  getHideableWearableCategories,
  isSmart,
  hasVideo
} from 'modules/item/utils'
import { isLocked } from 'modules/collection/utils'
import { computeHashes } from 'modules/deployment/contentUtils'
import {
  EmotePlayMode,
  isEmoteData,
  Item,
  ItemType,
  ITEM_DESCRIPTION_MAX_LENGTH,
  ITEM_NAME_MAX_LENGTH,
  THUMBNAIL_PATH,
  WearableData,
  VIDEO_PATH,
  SyncStatus
} from 'modules/item/types'
import { dataURLToBlob } from 'modules/media/utils'
import Collapsable from 'components/Collapsable'
import ConfirmDelete from 'components/ConfirmDelete'
import Icon from 'components/Icon'
import Info from 'components/Info'
import ItemImage from 'components/ItemImage'
import ItemProvider from 'components/ItemProvider'
import ItemVideo from 'components/ItemVideo'
import ItemProperties from 'components/ItemProperties'
import ItemRequiredPermission from 'components/ItemRequiredPermission'
import { EditVideoModalMetadata } from 'components/Modals/EditVideoModal/EditVideoModal.types'
import Input from './Input'
import Select from './Select'
import MultiSelect from './MultiSelect'
import Tags from './Tags'
import { Props, State } from './RightPanel.types'
import './RightPanel.css'

const CAMPAIGN_TAG = 'DCLMF23'

export default class RightPanel extends React.PureComponent<Props, State> {
  analytics = getAnalytics()
  state: State = this.getInitialState()
  thumbnailInput = React.createRef<HTMLInputElement>()

  componentDidMount() {
    const { selectedItem } = this.props

    if (selectedItem) {
      this.setItem(selectedItem)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { selectedItemId, selectedItem } = this.props

    if (prevProps.selectedItemId !== selectedItemId) {
      if (selectedItem) {
        this.setItem(selectedItem)
      } else {
        this.setState(this.getInitialState())
      }
    } else if (selectedItem && (!prevProps.selectedItem || this.hasSavedItem())) {
      this.setItem(selectedItem)
    }
  }

  setItem(item: Item) {
    const data = item.data

    if (item.type === ItemType.WEARABLE && data.replaces?.length) {
      // Move all items that are in replaces array to hides array
      data.hides = data.hides.concat(data.replaces)
      data.replaces = []
    }

    this.setState({
      thumbnail: '',
      video: '',
      name: item.name,
      description: item.description,
      rarity: item.rarity,
      data: item.data,
      hasItem: true,
      isDirty: false
    })
  }

  getInitialState(): State {
    return {
      name: '',
      description: '',
      thumbnail: '',
      video: '',
      rarity: undefined,
      contents: {},
      data: undefined,
      hasItem: false,
      isDirty: false
    }
  }

  handleDeleteItem = () => {
    const { onDeleteItem } = this.props
    const { selectedItem } = this.props
    onDeleteItem(selectedItem!)
  }

  handleAddRepresentationToItem = () => {
    const { selectedItem, onOpenModal } = this.props
    onOpenModal('CreateSingleItemModal', { item: selectedItem, addRepresentation: true })
  }

  handleChangeItemFile = () => {
    const { selectedItem, onOpenModal } = this.props
    onOpenModal('CreateSingleItemModal', { item: selectedItem, changeItemFile: true })
  }

  handleOpenVideoDialog = (metadata: Partial<EditVideoModalMetadata> = {}) => {
    const { selectedItem, onOpenModal } = this.props
    onOpenModal('EditVideoModal', { item: selectedItem, onSaveVideo: this.handleSaveVideo, ...metadata })
  }

  handleSaveVideo = (video: Blob) => {
    this.setState({ video: URL.createObjectURL(video), contents: { ...this.state.contents, [VIDEO_PATH]: video }, isDirty: true })
  }

  handleChangeName = (name: string) => {
    this.setState({ name, isDirty: this.isDirty({ name }) })
  }

  handleChangeDescription = (description: string) => {
    this.setState({ description, isDirty: this.isDirty({ description }) })
  }

  handleChangeRarity = (rarity: Rarity) => {
    this.setState({ rarity, isDirty: this.isDirty({ rarity }) })
  }

  handleChangeCategory = (category: HideableWearableCategory | EmoteCategory) => {
    let data
    if (isEmoteData(this.state.data!)) {
      data = {
        ...this.state.data,
        category
      } as EmoteDataADR74
    } else {
      data = {
        ...this.state.data,
        category
      } as WearableData
      // when changing the category to SKIN we hide everything else
      if (category === WearableCategory.SKIN) {
        data = this.setReplaces(data, [])
        data = this.setHides(data, [])
      }
    }
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  handlePlayModeChange = (playMode: EmotePlayMode) => {
    const data: EmoteDataADR74 = {
      ...(this.state.data as EmoteDataADR74),
      loop: playMode === EmotePlayMode.LOOP
    }
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  setReplaces(data: WearableData, replaces: HideableWearableCategory[]) {
    return {
      ...data,
      replaces,
      representations: data.representations.map(representation => ({
        ...representation,
        overrideReplaces: replaces
      }))
    }
  }

  handleChangeReplaces = (replaces: HideableWearableCategory[]) => {
    const data = this.setReplaces(this.state.data as WearableData, replaces)
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  setHides(data: WearableData, hides: HideableWearableCategory[]): WearableData {
    return {
      ...data,
      hides,
      representations: data.representations.map(representation => ({
        ...representation,
        overrideHides: hides
      }))
    }
  }

  handleChangeHides = (value: HideableWearableCategory[], category?: 'wearable' | 'bodypart') => {
    const currentHides = (this.state.data as WearableData).hides

    let hides: HideableWearableCategory[] = []
    if (category === 'wearable') {
      hides = [...currentHides.filter(cat => !WearableCategory.schema.enum.includes(cat)), ...value]
    } else {
      hides = [...currentHides.filter(cat => !BodyPartCategory.schema.enum.includes(cat)), ...value]
    }

    const data = this.setHides(this.state.data as WearableData, hides)
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  handleChangeTags = (tags: string[]) => {
    const data = {
      ...this.state.data!,
      tags
    }

    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  handleOnSaveItem = async () => {
    const { selectedItem, itemStatus, onSaveItem } = this.props
    const { name, description, rarity, contents, data, isDirty } = this.state

    if (isDirty && selectedItem) {
      let itemData = data
      //override hands default hiding for all new wearables
      if (itemData && !isEmoteData(itemData)) {
        itemData = {
          ...itemData,
          removesDefaultHiding:
            itemData.category === WearableCategory.UPPER_BODY || itemData.hides?.includes(WearableCategory.UPPER_BODY)
              ? [BodyPartCategory.HANDS]
              : []
        }
      }
      const itemContents = {
        ...selectedItem.contents,
        ...(await computeHashes(contents))
      }
      const item: Item = {
        ...selectedItem,
        name,
        description,
        rarity,
        data: itemData as WearableData,
        contents: itemContents
      }

      if (itemStatus && [SyncStatus.UNPUBLISHED, SyncStatus.UNDER_REVIEW].includes(itemStatus)) {
        item.video = itemContents[VIDEO_PATH]
      }

      onSaveItem(item, contents)
      if (isThirdParty(item.urn)) {
        this.analytics.track('Edit Item', { contents })
      }
      this.setState({ isDirty: false })
      this.handleOnResetItem()
    }
  }

  handleOnResetItem = () => {
    const { selectedItem } = this.props
    if (selectedItem) {
      this.setItem(selectedItem)
    }
  }

  handleOpenThumbnailDialog = () => {
    const { selectedItem, onOpenModal } = this.props

    if (selectedItem?.type === ItemType.EMOTE) {
      onOpenModal('EditThumbnailModal', { onSaveThumbnail: this.handleEmoteThumbnailChange, item: selectedItem })
    } else if (this.thumbnailInput.current) {
      this.thumbnailInput.current.click()
    }
  }

  handleEmoteThumbnailChange = (thumbnail: string) => {
    const blob = dataURLToBlob(thumbnail)!
    this.setState({ thumbnail, contents: { [THUMBNAIL_PATH]: blob }, isDirty: true })
  }

  handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target

    if (files && files.length > 0) {
      const file = files[0]
      const smallThumbnailBlob = await resizeImage(file)
      const bigThumbnailBlob = await resizeImage(file, 1024, 1024)
      const thumbnail = URL.createObjectURL(smallThumbnailBlob)

      this.setState({
        thumbnail,
        contents: { [THUMBNAIL_PATH]: bigThumbnailBlob },
        isDirty: true
      })
    }
  }

  handleDownloadItem = () => {
    const { selectedItemId, onDownload } = this.props
    selectedItemId && onDownload(selectedItemId)
  }

  canEditItemMetadata(item: Item | null) {
    const { collection, canEditSelectedItem } = this.props
    if (!item || (collection && isLocked(collection))) {
      return false
    }
    return canEditSelectedItem
  }

  isSkin() {
    const { data } = this.state
    return data?.category === WearableCategory.SKIN
  }

  isDirty(newState: Partial<State> = {}) {
    const { selectedItem } = this.props
    const { hasItem } = this.state

    return hasItem ? this.hasStateItemChanged({ ...this.state, ...newState }, selectedItem!) : false
  }

  hasSavedItem() {
    const { selectedItem } = this.props
    const { isDirty } = this.state
    return selectedItem && !isDirty && this.hasStateItemChanged(this.state, selectedItem)
  }

  hasStateItemChanged(state: Partial<State>, item: Item) {
    return (
      state.name !== item.name || state.description !== item.description || state.rarity !== item.rarity || !equal(state.data, item.data)
    )
  }

  asCategorySelect<T extends WearableCategory | BodyPartCategory | EmoteCategory>(
    type: ItemType,
    values: T[]
  ): { value: T; text: string }[] {
    return values.map(value => ({ value, text: t(`${type}.category.${value as string}`) }))
  }

  asRaritySelect(values: Rarity[]) {
    return values.map(value => ({ value, text: t(`wearable.rarity.${value}`) }))
  }

  asPlayModeSelect(values: EmotePlayMode[]) {
    return values.map(value => ({
      value,
      text: t(`emote.play_mode.${value}.text`),
      description: t(`emote.play_mode.${value}.description`)
    }))
  }

  renderOverrides(item: Item) {
    const canEditItemMetadata = this.canEditItemMetadata(item)
    const data = this.state.data as WearableData

    if (!item || isEmoteData(data)) {
      return null
    }

    const hideableWearableCategories = getHideableWearableCategories(item.contents, data.category)
    const hideableBodyPartCategories = getHideableBodyPartCategories(item.contents)

    const hidesWearable = data.hides.filter(category =>
      hideableWearableCategories.includes(category as WearableCategory)
    ) as WearableCategory[]
    const hidesBodyPart = data.hides.filter(category =>
      hideableBodyPartCategories.includes(category as BodyPartCategory)
    ) as BodyPartCategory[]

    return (
      <>
        <MultiSelect<BodyPartCategory>
          itemId={item.id}
          label={t('item_editor.right_panel.base_body')}
          info={t('item_editor.right_panel.base_body_info')}
          value={hidesBodyPart}
          options={this.asCategorySelect(item.type, hideableBodyPartCategories)}
          disabled={!canEditItemMetadata}
          onChange={value => this.handleChangeHides(value, 'bodypart')}
        />
        <MultiSelect<WearableCategory>
          itemId={item.id}
          label={t('item_editor.right_panel.wearables')}
          info={t('item_editor.right_panel.wearables_info')}
          value={hidesWearable}
          options={this.asCategorySelect(
            item.type,
            // Workaround for https://github.com/decentraland/builder/issues/2068
            // This will only show the body shape option if the item is currenlty hiding it.
            // Once removed, the option cannot be selected again
            hidesWearable.some(c => c === WearableCategory.BODY_SHAPE)
              ? hideableWearableCategories
              : hideableWearableCategories.filter(c => c !== WearableCategory.BODY_SHAPE)
          )}
          disabled={!canEditItemMetadata}
          onChange={value => this.handleChangeHides(value, 'wearable')}
        />
      </>
    )
  }

  renderModelDetails(item: Item) {
    const { isDownloading } = this.props
    const { thumbnail } = this.state

    const canEditItemMetadata = this.canEditItemMetadata(item)

    const downloadButton = isDownloading ? (
      <Loader active size="tiny" className="donwload-item-loader" />
    ) : (
      <Icon name="export" className={'download-item-button'} onClick={this.handleDownloadItem} />
    )

    return (
      <div className="details">
        {canEditItemMetadata ? (
          <>
            <Icon name="edit" className="edit-item-file" onClick={this.handleChangeItemFile} />
            {downloadButton}
            <div className="thumbnail-container">
              <ItemImage item={item} src={thumbnail} hasBadge={true} badgeSize="small" />
              <div className="thumbnail-edit-container">
                <input type="file" ref={this.thumbnailInput} onChange={this.handleThumbnailChange} accept="image/png" />
                <div className="thumbnail-edit-background"></div>
                <Icon name="camera" onClick={this.handleOpenThumbnailDialog} />
              </div>
            </div>
          </>
        ) : (
          <>
            {downloadButton}
            <ItemImage item={item} src={thumbnail} hasBadge={true} badgeSize="small" />
          </>
        )}
        <ItemProperties item={item} />
      </div>
    )
  }

  renderVideoDetails(item: Item) {
    if (!isSmart(item)) {
      return null
    }

    const canEditItemMetadata = this.canEditItemMetadata(item)

    const handleOpenVideoDialog = canEditItemMetadata
      ? () => this.handleOpenVideoDialog()
      : () => this.handleOpenVideoDialog({ viewOnly: true })

    return (
      <div className="details">
        {canEditItemMetadata ? (
          <>
            <Icon name="edit" className="edit-item-file" onClick={handleOpenVideoDialog} />
            <Icon name="play" className="play-video-button" onClick={handleOpenVideoDialog} />
            <ItemVideo item={item} src={this.state.video} showMetrics onClick={handleOpenVideoDialog} />
          </>
        ) : (
          <>
            {hasVideo(item) && <Icon name="play" className="play-video-button" onClick={handleOpenVideoDialog} />}
            <ItemVideo item={item} src={this.state.video} showMetrics />
          </>
        )}
      </div>
    )
  }

  renderPermissions(item: Item) {
    return <ItemRequiredPermission requiredPermissions={item.data.requiredPermissions} />
  }

  render() {
    const { selectedItemId, address, isConnected, error, isCampaignEnabled, isExoticRarityEnabled } = this.props
    const { name, description, rarity, data, isDirty, hasItem } = this.state
    const rarities = Rarity.getRarities().filter(rarity => isExoticRarityEnabled || rarity !== Rarity.EXOTIC)
    const playModes = getEmotePlayModes()

    return (
      <div className="RightPanel">
        {isConnected ? (
          <ItemProvider id={selectedItemId}>
            {(item, collection, isLoading) => {
              const isItemLocked = collection && isLocked(collection)
              const canEditItemMetadata = this.canEditItemMetadata(item)

              const categories = item ? (item.type === ItemType.WEARABLE ? getWearableCategories(item.contents) : getEmoteCategories()) : []

              return isLoading ? (
                <Loader size="massive" active />
              ) : hasItem || !selectedItemId ? (
                <>
                  <div className="header">
                    <div className="title">{t('item_editor.right_panel.properties')}</div>
                    {item && isOwner(item, address) && !item.isPublished && !isItemLocked ? (
                      <Dropdown trigger={<div className="actions" />} inline direction="left">
                        <Dropdown.Menu>
                          {getMissingBodyShapeType(item) !== null ? (
                            <Dropdown.Item
                              text={t('item_detail_page.add_representation', {
                                bodyShape: t(`body_shapes.${getMissingBodyShapeType(item)!}`).toLowerCase()
                              })}
                              onClick={this.handleAddRepresentationToItem}
                            />
                          ) : null}
                          <ConfirmDelete
                            name={name}
                            onDelete={this.handleDeleteItem}
                            trigger={<Dropdown.Item text={t('global.delete')} />}
                          />
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : null}
                  </div>
                  <div className="container">
                    <Collapsable label={t('item_editor.right_panel.details')}>
                      {item ? (
                        <>
                          {this.renderModelDetails(item)}
                          {this.renderVideoDetails(item)}
                        </>
                      ) : null}
                    </Collapsable>
                    <Collapsable label={t('item_editor.right_panel.basics')}>
                      {item ? (
                        <>
                          <Input
                            itemId={item.id}
                            label={t('global.name')}
                            value={name}
                            disabled={!canEditItemMetadata}
                            maxLength={ITEM_NAME_MAX_LENGTH}
                            onChange={this.handleChangeName}
                          />
                          <Input
                            itemId={item.id}
                            label={t('global.description')}
                            value={description}
                            disabled={!canEditItemMetadata}
                            maxLength={ITEM_DESCRIPTION_MAX_LENGTH}
                            onChange={this.handleChangeDescription}
                          />

                          <Select<HideableWearableCategory | EmoteCategory>
                            itemId={item.id}
                            label={t('global.category')}
                            value={data!.category}
                            options={this.asCategorySelect<WearableCategory | EmoteCategory>(item.type, categories)}
                            disabled={!canEditItemMetadata}
                            onChange={this.handleChangeCategory}
                          />

                          {!(item.urn && isThirdParty(item.urn)) && (
                            <Select<Rarity>
                              itemId={item.id}
                              label={t('global.rarity')}
                              value={rarity}
                              options={this.asRaritySelect(rarities)}
                              disabled={item.isPublished || !canEditItemMetadata}
                              onChange={this.handleChangeRarity}
                            />
                          )}
                        </>
                      ) : null}
                    </Collapsable>
                    {item?.type === ItemType.WEARABLE && (
                      <Collapsable
                        label={
                          <>
                            <span className="overrides-label-panel">{t('item_editor.right_panel.overrides')}</span>
                            <Info content={t('item_editor.right_panel.overrides_info')} className="info" />
                          </>
                        }
                      >
                        {this.renderOverrides(item)}
                      </Collapsable>
                    )}
                    {item?.type === ItemType.EMOTE && (
                      <Collapsable label={t('item_editor.right_panel.animation')}>
                        {item ? (
                          <Select<EmotePlayMode>
                            itemId={item.id}
                            label={t('create_single_item_modal.play_mode_label')}
                            value={(data as EmoteDataADR74).loop ? EmotePlayMode.LOOP : EmotePlayMode.SIMPLE}
                            options={this.asPlayModeSelect(playModes)}
                            disabled={!canEditItemMetadata}
                            onChange={this.handlePlayModeChange}
                          />
                        ) : null}
                      </Collapsable>
                    )}
                    {item && isSmart(item) && item.data.requiredPermissions?.length ? (
                      <Collapsable label={t('item_editor.right_panel.required_permissions')}>{this.renderPermissions(item)}</Collapsable>
                    ) : null}
                    <Collapsable label={t('item_editor.right_panel.tags')}>
                      {item ? (
                        <>
                          <Tags itemId={item.id} value={data!.tags} onChange={this.handleChangeTags} isDisabled={!canEditItemMetadata} />
                          {isCampaignEnabled && canEditItemMetadata && (
                            <p className="event-tag">
                              {t('item_editor.right_panel.event_tag', {
                                event_tag: <span>{CAMPAIGN_TAG}</span>,
                                event_name: <span>{t('campaign.name')}</span>
                              })}
                            </p>
                          )}
                        </>
                      ) : null}
                    </Collapsable>
                    {isDirty ? (
                      <div className="edit-buttons">
                        <Button secondary onClick={this.handleOnResetItem}>
                          {t('global.cancel')}
                        </Button>
                        <NetworkButton primary onClick={this.handleOnSaveItem} network={Network.MATIC}>
                          {t('global.save')}
                        </NetworkButton>
                      </div>
                    ) : error && selectedItemId ? (
                      <p className="danger-text">
                        {t('global.error_ocurred')}: {error}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : null
            }}
          </ItemProvider>
        ) : null}
      </div>
    )
  }
}
