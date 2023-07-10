import * as React from 'react'
import equal from 'fast-deep-equal'
import { Loader, Dropdown, Button } from 'decentraland-ui'
import { EmoteCategory, EmoteDataADR74, HideableWearableCategory, Network, WearableCategory } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { isThirdParty } from 'lib/urn'
import ItemImage from 'components/ItemImage'
import ItemProvider from 'components/ItemProvider'
import ConfirmDelete from 'components/ConfirmDelete'
import Icon from 'components/Icon'
import {
  getMissingBodyShapeType,
  getRarities,
  getWearableCategories,
  getOverridesCategories,
  isOwner,
  resizeImage,
  getEmoteCategories,
  getEmotePlayModes
} from 'modules/item/utils'
import { isLocked } from 'modules/collection/utils'
import { computeHashes } from 'modules/deployment/contentUtils'
import {
  EmotePlayMode,
  isEmoteData,
  Item,
  ItemRarity,
  ItemType,
  ITEM_DESCRIPTION_MAX_LENGTH,
  ITEM_NAME_MAX_LENGTH,
  THUMBNAIL_PATH,
  WearableData
} from 'modules/item/types'
import { dataURLToBlob } from 'modules/media/utils'
import { areEmoteMetrics } from 'modules/models/types'
import Collapsable from 'components/Collapsable'
import Input from './Input'
import Select from './Select'
import MultiSelect from './MultiSelect'
import Tags from './Tags'
import { Props, State } from './RightPanel.types'
import './RightPanel.css'

const CAMPAIGN_TAG = 'PRIDE23'

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
    this.setState({
      thumbnail: '',
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

  handleChangeName = (name: string) => {
    this.setState({ name, isDirty: this.isDirty({ name }) })
  }

  handleChangeDescription = (description: string) => {
    this.setState({ description, isDirty: this.isDirty({ description }) })
  }

  handleChangeRarity = (rarity: ItemRarity) => {
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
      ...(this.state.data as EmoteDataADR74)!,
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
    const data = this.setReplaces((this.state.data as WearableData)!, replaces)
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  setHides(data: WearableData, hides: HideableWearableCategory[]) {
    return {
      ...data,
      hides,
      representations: data.representations.map(representation => ({
        ...representation,
        overrideHides: hides
      }))
    }
  }

  handleChangeHides = (hides: HideableWearableCategory[]) => {
    const data = this.setHides((this.state.data as WearableData)!, hides)
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
    const { selectedItem, onSaveItem } = this.props
    const { name, description, rarity, contents, data, isDirty } = this.state

    if (isDirty && selectedItem) {
      const itemContents = {
        ...selectedItem.contents,
        ...(await computeHashes(contents))
      }
      const item: Item = {
        ...selectedItem,
        name,
        description,
        rarity,
        data: (data as WearableData)!,
        contents: itemContents
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

  asCategorySelect(type: ItemType, values: HideableWearableCategory[]) {
    return values.map(value => ({ value, text: t(`${type}.category.${value}`) }))
  }

  asRaritySelect(values: ItemRarity[]) {
    return values.map(value => ({ value, text: t(`wearable.rarity.${value}`) }))
  }

  asPlayModeSelect(values: EmotePlayMode[]) {
    return values.map(value => ({
      value,
      text: t(`emote.play_mode.${value}.text`),
      description: t(`emote.play_mode.${value}.description`)
    }))
  }

  renderMetrics(item: Item) {
    const metrics = item.metrics
    if (areEmoteMetrics(metrics)) {
      return (
        <div className="metrics">
          <div className="metric circle">{t('model_metrics.sequences', { count: metrics.sequences })}</div>
          <div className="metric circle">{t('model_metrics.duration', { count: metrics.duration.toFixed(2) })}</div>
          <div className="metric circle">{t('model_metrics.frames', { count: metrics.frames })}</div>
          <div className="metric circle">{t('model_metrics.fps', { count: metrics.fps.toFixed(2) })}</div>
        </div>
      )
    } else {
      return (
        <div className="metrics">
          <div className="metric triangles">{t('model_metrics.triangles', { count: metrics.triangles })}</div>
          <div className="metric materials">{t('model_metrics.materials', { count: metrics.materials })}</div>
          <div className="metric textures">{t('model_metrics.textures', { count: metrics.textures })}</div>
        </div>
      )
    }
  }

  render() {
    const { selectedItemId, address, isConnected, isDownloading, error, isCampaignEnabled } = this.props
    const { name, description, thumbnail, rarity, data, isDirty, hasItem } = this.state
    const rarities = getRarities()
    const playModes = getEmotePlayModes()

    return (
      <div className="RightPanel">
        {isConnected ? (
          <ItemProvider id={selectedItemId}>
            {(item, collection, isLoading) => {
              const isItemLocked = collection && isLocked(collection)
              const canEditItemMetadata = this.canEditItemMetadata(item)

              const actionableCategories: string[] = item
                ? item.type === ItemType.WEARABLE
                  ? getOverridesCategories(item.contents, (data as WearableData)?.category)
                  : getEmoteCategories()
                : []
              const wearableCategories = item
                ? item.type === ItemType.WEARABLE
                  ? getWearableCategories(item.contents)
                  : getEmoteCategories()
                : []

              let overrideCategories: HideableWearableCategory[] = []
              let hidesCategories: HideableWearableCategory[] = []
              let replaces: HideableWearableCategory[] = []
              let hides: HideableWearableCategory[] = []

              if (data && !isEmoteData(data)) {
                hides = data.hides ? data.hides.filter(category => actionableCategories.includes(category)) : []
                replaces = data.replaces ? data.replaces.filter(category => actionableCategories.includes(category)) : []
                hidesCategories = actionableCategories.filter(
                  category => !replaces.includes(category as WearableCategory)
                ) as WearableCategory[]
                overrideCategories = actionableCategories.filter(
                  category => !hides.includes(category as WearableCategory)
                ) as WearableCategory[]
              }

              const downloadButton = isDownloading ? (
                <Loader active size="tiny" className="donwload-item-loader" />
              ) : (
                <Icon name="export" className={'download-item-button'} onClick={this.handleDownloadItem} />
              )

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
                  <Collapsable label={t('item_editor.right_panel.details')}>
                    {item ? (
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
                        {this.renderMetrics(item)}
                      </div>
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
                          options={this.asCategorySelect(item.type, wearableCategories as HideableWearableCategory[])}
                          disabled={!canEditItemMetadata}
                          onChange={this.handleChangeCategory}
                        />

                        {!(item.urn && isThirdParty(item.urn)) && (
                          <Select<ItemRarity>
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
                    <Collapsable label={t('item_editor.right_panel.overrides')}>
                      {item ? (
                        <>
                          <MultiSelect<HideableWearableCategory>
                            itemId={item.id}
                            label={t('item_editor.right_panel.replaces')}
                            info={t('item_editor.right_panel.replaces_info')}
                            value={replaces}
                            options={this.asCategorySelect(item.type, overrideCategories)}
                            disabled={!canEditItemMetadata || this.isSkin()}
                            onChange={this.handleChangeReplaces}
                          />
                          <MultiSelect<HideableWearableCategory>
                            itemId={item.id}
                            label={t('item_editor.right_panel.hides')}
                            info={t('item_editor.right_panel.hides_info')}
                            value={hides}
                            options={this.asCategorySelect(
                              item.type,
                              // Workaround for https://github.com/decentraland/builder/issues/2068
                              // This will only show the body shape option if the item is currenlty hiding it.
                              // Once removed, the option cannot be selected again
                              hides.some(c => c === WearableCategory.BODY_SHAPE)
                                ? hidesCategories
                                : hidesCategories.filter(c => c !== WearableCategory.BODY_SHAPE)
                            )}
                            disabled={!canEditItemMetadata}
                            onChange={this.handleChangeHides}
                          />
                        </>
                      ) : null}
                    </Collapsable>
                  )}
                  {item?.type === ItemType.EMOTE && (
                    <Collapsable label={t('item_editor.right_panel.animation')}>
                      {item ? (
                        <Select<EmotePlayMode>
                          itemId={item.id}
                          label={t('create_single_item_modal.play_mode_label')}
                          value={(data as EmoteDataADR74)!.loop ? EmotePlayMode.LOOP : EmotePlayMode.SIMPLE}
                          options={this.asPlayModeSelect(playModes)}
                          disabled={!canEditItemMetadata}
                          onChange={this.handlePlayModeChange}
                        />
                      ) : null}
                    </Collapsable>
                  )}
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
                </>
              ) : null
            }}
          </ItemProvider>
        ) : null}
      </div>
    )
  }
}
