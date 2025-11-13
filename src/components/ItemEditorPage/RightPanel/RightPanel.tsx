import { AnimationClip } from 'three'
import * as React from 'react'
import equal from 'fast-deep-equal'
import { Loader, Dropdown, Button, Checkbox, CheckboxProps, TextAreaField, TextAreaProps, Row, Box, Header } from 'decentraland-ui'
import {
  BodyPartCategory,
  EmoteCategory,
  Rarity,
  EmoteDataADR74,
  HideableWearableCategory,
  Network,
  WearableCategory,
  ArmatureId,
  StartAnimation
} from '@dcl/schemas'
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
  hasVideo,
  isWearable,
  isAudioFile,
  itemHasAudio
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
  OUTCOME_TITLE_MAX_LENGTH,
  THUMBNAIL_PATH,
  WearableData,
  VIDEO_PATH,
  SyncStatus,
  ITEM_UTILITY_MAX_LENGTH,
  EmoteData
} from 'modules/item/types'
import { isSocialEmoteMetrics } from 'modules/models/types'
import { dataURLToBlob } from 'modules/media/utils'
import Collapsable from 'components/Collapsable'
import ConfirmDelete from 'components/ConfirmDelete'
import Icon from 'components/Icon'
import Info from 'components/Info'
import ItemImage from 'components/ItemImage'
import ItemProvider from 'components/ItemProvider'
import { AnimationData } from 'components/ItemProvider/ItemProvider.types'
import ItemVideo from 'components/ItemVideo'
import ItemProperties from 'components/ItemProperties'
import ItemRequiredPermission from 'components/ItemRequiredPermission'
import { EditVideoModalMetadata } from 'components/Modals/EditVideoModal/EditVideoModal.types'
import DynamicInput from './DynamicInput/DynamicInput'
import Input from './Input'
import Select from './Select'
import MultiSelect from './MultiSelect'
import Tags from './Tags'
import { Props, State } from './RightPanel.types'
import './RightPanel.css'

const MAX_OUTCOMES = 3

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

    if (isWearable(item) && data.replaces?.length) {
      // Move all items that are in replaces array to hides array
      data.hides = data.hides.concat(data.replaces)
      data.replaces = []
    }

    this.setState({
      thumbnail: '',
      video: '',
      name: item.name,
      description: item.description,
      utility: item.utility || '',
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
      utility: '',
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

  handleChangeDescription = (_event: React.ChangeEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
    const description = (data.value as string | undefined) ?? ''
    this.setState({ description, isDirty: this.isDirty({ description }) })
  }

  handleChangeUtility = (_event: React.ChangeEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
    const utility = (data.value as string | undefined) ?? ''
    this.setState({ utility, isDirty: this.isDirty({ utility }) })
  }

  handleChangeRarity = (rarity: Rarity) => {
    this.setState({ rarity, isDirty: this.isDirty({ rarity }) })
  }

  handleAllowVrmExport = (_event: React.FormEvent, { checked }: CheckboxProps) => {
    const data = {
      ...this.state.data,
      blockVrmExport: !checked
    } as WearableData
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  handleAllowOutlineCompatible = (_event: React.FormEvent, { checked }: CheckboxProps) => {
    const data = {
      ...this.state.data,
      outlineCompatible: checked
    } as WearableData
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  handleChangeCategory = (category: HideableWearableCategory | EmoteCategory) => {
    let data
    if (isEmoteData(this.state.data)) {
      data = {
        ...this.state.data,
        category
      } as EmoteData
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

  handleStartAnimationArmatureAnimationChange = (prop: ArmatureId.Armature | ArmatureId.Armature_Prop, value: string) => {
    const data = this.state.data as EmoteData
    const startAnimation = { ...(data.startAnimation || {}) }

    // For optional fields (Armature_Prop), remove the entire prop if value is empty
    if (value === '' && prop === ArmatureId.Armature_Prop) {
      delete startAnimation[prop]
    } else {
      startAnimation[prop] = { animation: value }
    }

    this.setState({
      data: { ...data, startAnimation: startAnimation as StartAnimation },
      isDirty: this.isDirty({ data: { ...data, startAnimation: startAnimation as StartAnimation } })
    })
  }

  handleStartAnimationAudioClipChange = (audio: string) => {
    const data = this.state.data as EmoteData
    const startAnimation = { ...(data.startAnimation || {}) }
    startAnimation.audio = audio || undefined
    this.setState({
      data: { ...data, startAnimation: startAnimation as StartAnimation },
      isDirty: this.isDirty({ data: { ...data, startAnimation: startAnimation as StartAnimation } })
    })
  }

  handleStartAnimationPlayModeChange = (loop: boolean) => {
    const data = this.state.data as EmoteData
    const startAnimation = { ...(data.startAnimation || {}) }
    startAnimation.loop = loop
    this.setState({
      data: { ...data, startAnimation: startAnimation as StartAnimation },
      isDirty: this.isDirty({ data: { ...data, startAnimation: startAnimation as StartAnimation } })
    })
  }

  handleRandomizeOutcomesChange = (randomize: boolean) => {
    const data = {
      ...this.state.data,
      randomizeOutcomes: randomize
    } as EmoteData
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  handleOutcomeChange = (outcomeIndex: number, field: string, value: string) => {
    const data = this.state.data as any
    const outcomes = [...data.outcomes]
    outcomes[outcomeIndex] = {
      ...outcomes[outcomeIndex],
      [field]: value
    }
    this.setState({
      data: { ...data, outcomes },
      isDirty: this.isDirty({ data: { ...data, outcomes } })
    })
  }

  handleOutcomeClipChange = (outcomeIndex: number, armatureId: ArmatureId, field: string, value: string) => {
    const data = this.state.data as EmoteData
    const outcomes = [...(data.outcomes || [])]
    const clips = { ...outcomes[outcomeIndex].clips }

    if (value === '') {
      // Remove the entire armatureId if value is empty
      delete clips[armatureId]
    } else {
      if (!clips[armatureId]) {
        clips[armatureId] = {
          animation: ''
        }
      }
      clips[armatureId] = {
        ...clips[armatureId],
        [field]: value
      }
    }

    outcomes[outcomeIndex] = {
      ...outcomes[outcomeIndex],
      clips
    }
    this.setState({
      data: { ...data, outcomes },
      isDirty: this.isDirty({ data: { ...data, outcomes } })
    })
  }

  handleOutcomeAudioClipChange = (outcomeIndex: number, audio: string) => {
    const data = this.state.data as EmoteData
    const outcomes = [...(data.outcomes || [])]
    outcomes[outcomeIndex].audio = audio || undefined
    this.setState({ data: { ...data, outcomes }, isDirty: this.isDirty({ data: { ...data, outcomes } }) })
  }

  handleOutcomePlayModeChange = (outcomeIndex: number, loop: boolean) => {
    const data = this.state.data as EmoteData
    const outcomes = [...(data.outcomes || [])]
    outcomes[outcomeIndex].loop = loop
    this.setState({
      data: { ...data, outcomes },
      isDirty: this.isDirty({ data: { ...data, outcomes } })
    })
  }

  handleAddOutcome = () => {
    const data = this.state.data as EmoteData
    if (!data || !data.outcomes) {
      data.outcomes = []
    }
    const newOutcome = {
      title: `Outcome ${data.outcomes.length + 1}`,
      clips: {},
      loop: false
    }
    const outcomes = [...data.outcomes, newOutcome]
    this.setState({
      data: { ...data, outcomes },
      isDirty: this.isDirty({ data: { ...data, outcomes } })
    })
  }

  handleRemoveOutcome = (outcomeIndex: number) => {
    const data = this.state.data as any
    const outcomes = data.outcomes.filter((_: any, index: number) => index !== outcomeIndex)
    this.setState({
      data: { ...data, outcomes },
      isDirty: this.isDirty({ data: { ...data, outcomes } })
    })
  }

  handleEditOutcomeTitle = (outcomeIndex: number, value: string) => {
    // Update the outcome title
    this.handleOutcomeChange(outcomeIndex, 'title', value)
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
    const { name, description, utility, rarity, contents, data, isDirty } = this.state

    if (isDirty && selectedItem) {
      let itemData = data
      //override hands default hiding for all new wearables
      if (itemData && !isEmoteData(itemData)) {
        itemData = {
          ...itemData,
          removesDefaultHiding:
            itemData.category === WearableCategory.UPPER_BODY || itemData.hides?.includes(WearableCategory.UPPER_BODY)
              ? [BodyPartCategory.HANDS]
              : [],
          ...('blockVrmExport' in itemData ? { blockVrmExport: itemData.blockVrmExport } : {}),
          ...('outlineCompatible' in itemData ? { outlineCompatible: itemData.outlineCompatible } : {})
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
        contents: itemContents,
        utility: utility ?? undefined
      }

      if (itemStatus && [SyncStatus.UNPUBLISHED, SyncStatus.UNDER_REVIEW].includes(itemStatus)) {
        item.video = itemContents[VIDEO_PATH]
      }

      onSaveItem(item, contents)
      if (isThirdParty(item.urn)) {
        this.analytics?.track('Edit Item', { contents })
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
      state.name !== item.name ||
      state.description !== item.description ||
      state.utility !== item.utility ||
      state.rarity !== item.rarity ||
      !equal(state.data, item.data)
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

  getAnimationOptions(animationData: AnimationData, optional = false): Array<{ value: string; text: string }> {
    if (!animationData.isLoaded) {
      return []
    }

    if (animationData.error) {
      console.warn('Animation data error:', animationData.error)
      return []
    }

    const options = animationData.animations.map((animation: AnimationClip) => ({
      value: animation.name,
      text: animation.name
    }))

    return optional ? [{ value: '', text: '--' }, ...options] : options
  }

  getAudioOptions(values: Item['contents']): Array<{ value: string; text: string }> {
    const audioFiles = new Set<string>()

    const options = Object.keys(values)
      .map(key => {
        if (isAudioFile(key)) {
          // Extract filename without male/ or female/ prefix
          const fileName = key.replace(/^(male|female)\//, '')

          // Only add if we haven't seen this filename before
          if (!audioFiles.has(fileName)) {
            audioFiles.add(fileName)
            return {
              value: fileName,
              text: fileName
            }
          }
        }
        return null
      })
      .filter(Boolean) as { value: string; text: string }[]

    return [{ value: '', text: '--' }, ...options]
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
    const {
      selectedItemId,
      address,
      isWearableUtilityEnabled,
      isConnected,
      error,
      isCampaignEnabled,
      isVrmOptOutEnabled,
      campaignName,
      campaignTag
    } = this.props
    const { name, description, utility, rarity, data, isDirty, hasItem } = this.state
    const rarities = Rarity.getRarities()
    const playModes = getEmotePlayModes()

    return (
      <div className="RightPanel">
        {isConnected ? (
          <ItemProvider id={selectedItemId}>
            {(item, collection, isLoading, animationData) => {
              const isItemLocked = collection && isLocked(collection)
              const canEditItemMetadata = this.canEditItemMetadata(item)

              const categories = item ? (isWearable(item) ? getWearableCategories(item.contents) : getEmoteCategories()) : []

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
                            label={t('global.name')}
                            value={name}
                            disabled={!canEditItemMetadata}
                            maxLength={ITEM_NAME_MAX_LENGTH}
                            onChange={this.handleChangeName}
                          />
                          <TextAreaField
                            maxLength={ITEM_DESCRIPTION_MAX_LENGTH}
                            onChange={this.handleChangeDescription}
                            label={t('global.description')}
                            placeholder={t('item_editor.right_panel.description_placeholder')}
                            disabled={!canEditItemMetadata}
                            value={description}
                            rows="2"
                            cols="12"
                          />
                          {isWearableUtilityEnabled ? (
                            <TextAreaField
                              maxLength={ITEM_UTILITY_MAX_LENGTH}
                              onChange={this.handleChangeUtility}
                              label={t('global.utility')}
                              placeholder={t('item_editor.right_panel.utility_placeholder')}
                              disabled={!canEditItemMetadata}
                              value={utility}
                              tooltip={{ content: t('item_editor.right_panel.utility_tooltip') }}
                              rows="2"
                              cols="12"
                            />
                          ) : null}
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
                    {item?.type === ItemType.EMOTE &&
                    item?.metrics &&
                    isSocialEmoteMetrics(item.metrics) &&
                    !!item.metrics.additionalArmatures ? (
                      <Collapsable label={t('item_editor.right_panel.animations')}>
                        <div className="animations-section">
                          <Box className="emote-request-state-box" header={<Header className="emote-start-header">Emote Start</Header>}>
                            <Select<string>
                              itemId={item.id}
                              label={`${t('item_editor.right_panel.social_emote.avatar')} 1`}
                              value={(data as unknown as EmoteData)?.startAnimation?.[ArmatureId.Armature]?.animation}
                              options={this.getAnimationOptions(animationData)}
                              disabled={isLoading}
                              onChange={value => this.handleStartAnimationArmatureAnimationChange(ArmatureId.Armature, value)}
                            />

                            <Select<string>
                              itemId={item.id}
                              label={`${t('item_editor.right_panel.social_emote.props')} (${t(
                                'item_editor.right_panel.social_emote.optional'
                              )})`}
                              value={(data as unknown as EmoteData)?.startAnimation?.[ArmatureId.Armature_Prop]?.animation}
                              options={this.getAnimationOptions(animationData, true)}
                              disabled={isLoading}
                              onChange={value => this.handleStartAnimationArmatureAnimationChange(ArmatureId.Armature_Prop, value)}
                            />

                            {Object.values(item.contents).length > 0 && itemHasAudio(item) ? (
                              <Select<string>
                                itemId={item.id}
                                label={`${t('item_editor.right_panel.social_emote.audio')} (${t(
                                  'item_editor.right_panel.social_emote.optional'
                                )})`}
                                value={(data as unknown as EmoteData)?.startAnimation?.audio}
                                options={this.getAudioOptions(item.contents)}
                                onChange={value => this.handleStartAnimationAudioClipChange(value)}
                              />
                            ) : null}
                            <Select<EmotePlayMode>
                              itemId={item.id}
                              label={t('create_single_item_modal.play_mode_label')}
                              value={(data as unknown as EmoteData)?.startAnimation?.loop ? EmotePlayMode.LOOP : EmotePlayMode.SIMPLE}
                              options={this.asPlayModeSelect(playModes)}
                              onChange={value => this.handleStartAnimationPlayModeChange(value === EmotePlayMode.LOOP)}
                              disabled // For now play mode for start animation is always loop
                            />
                          </Box>

                          {(data as unknown as EmoteData)?.outcomes && (data as unknown as EmoteData).outcomes!.length > 1 ? (
                            <Select<string>
                              itemId={item.id}
                              label={t('item_editor.right_panel.social_emote.randomize_outcomes')}
                              value={(data as unknown as EmoteData)?.randomizeOutcomes ? 'true' : 'false'}
                              options={[
                                { value: 'true', text: 'True' },
                                { value: 'false', text: 'False' }
                              ]}
                              disabled={isLoading}
                              onChange={value => this.handleRandomizeOutcomesChange(value === 'true')}
                            />
                          ) : null}

                          {(data as unknown as EmoteData)?.outcomes &&
                            (data as unknown as EmoteData).outcomes!.length > 0 &&
                            (data as unknown as EmoteData).outcomes!.map((outcome, outcomeIndex) => (
                              <Box
                                key={outcomeIndex}
                                className="outcome-box"
                                header={
                                  <div className="outcome-header">
                                    <DynamicInput
                                      className="outcome-title-input"
                                      value={outcome.title}
                                      editable
                                      maxLength={OUTCOME_TITLE_MAX_LENGTH}
                                      onChange={(value: string) => this.handleEditOutcomeTitle(outcomeIndex, value)}
                                    />
                                    {(data as unknown as EmoteData).outcomes!.length > 1 ? (
                                      <Button
                                        className="outcome-remove-button"
                                        icon="trash"
                                        size="tiny"
                                        basic
                                        onClick={() => this.handleRemoveOutcome(outcomeIndex)}
                                        disabled={isLoading}
                                        style={{ float: 'right', marginTop: '-2px' }}
                                      />
                                    ) : null}
                                  </div>
                                }
                              >
                                <Select<string>
                                  itemId={item.id}
                                  label={`${t('item_editor.right_panel.social_emote.avatar')} 1`}
                                  value={outcome.clips[ArmatureId.Armature]?.animation}
                                  options={this.getAnimationOptions(animationData)}
                                  disabled={isLoading}
                                  onChange={value => this.handleOutcomeClipChange(outcomeIndex, ArmatureId.Armature, 'animation', value)}
                                />

                                <Select<string>
                                  itemId={item.id}
                                  label={`${t('item_editor.right_panel.social_emote.avatar')} 2 (${t(
                                    'item_editor.right_panel.social_emote.optional'
                                  )})`}
                                  value={outcome.clips[ArmatureId.Armature_Other]?.animation}
                                  options={this.getAnimationOptions(animationData, true)}
                                  disabled={isLoading}
                                  onChange={value =>
                                    this.handleOutcomeClipChange(outcomeIndex, ArmatureId.Armature_Other, 'animation', value)
                                  }
                                />

                                <Select<string>
                                  itemId={item.id}
                                  label={`${t('item_editor.right_panel.social_emote.props')} (${t(
                                    'item_editor.right_panel.social_emote.optional'
                                  )})`}
                                  value={outcome.clips[ArmatureId.Armature_Prop]?.animation}
                                  options={this.getAnimationOptions(animationData, true)}
                                  disabled={isLoading}
                                  onChange={value =>
                                    this.handleOutcomeClipChange(outcomeIndex, ArmatureId.Armature_Prop, 'animation', value)
                                  }
                                />

                                {Object.values(item.contents).length > 0 && itemHasAudio(item) ? (
                                  <Select<string>
                                    itemId={item.id}
                                    label={`${t('item_editor.right_panel.social_emote.audio')} (${t(
                                      'item_editor.right_panel.social_emote.optional'
                                    )})`}
                                    value={outcome.audio}
                                    options={this.getAudioOptions(item.contents)}
                                    onChange={value => this.handleOutcomeAudioClipChange(outcomeIndex, value)}
                                  />
                                ) : null}

                                <Select<EmotePlayMode>
                                  itemId={item.id}
                                  label={t('create_single_item_modal.play_mode_label')}
                                  value={outcome?.loop ? EmotePlayMode.LOOP : EmotePlayMode.SIMPLE}
                                  options={this.asPlayModeSelect(playModes)}
                                  disabled={isLoading}
                                  onChange={value => this.handleOutcomePlayModeChange(outcomeIndex, value === EmotePlayMode.LOOP)}
                                />
                              </Box>
                            ))}

                          {((data as unknown as EmoteData)?.outcomes ?? []).length < MAX_OUTCOMES ? (
                            <Row className="add-outcome-button" align="left">
                              <Button secondary size="small" disabled={isLoading} onClick={this.handleAddOutcome}>
                                <Icon name="add" /> {t('item_editor.right_panel.social_emote.add_outcome')}
                              </Button>
                            </Row>
                          ) : null}
                        </div>
                      </Collapsable>
                    ) : (
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
                          {isCampaignEnabled && campaignName && campaignTag && canEditItemMetadata && (
                            <p className="event-tag">
                              {t('item_editor.right_panel.event_tag', {
                                event_tag: <span>{campaignTag}</span>,
                                event_name: <span>{campaignName}</span>
                              })}
                            </p>
                          )}
                        </>
                      ) : null}
                    </Collapsable>
                    {item?.type === ItemType.WEARABLE && isVrmOptOutEnabled && (
                      <Collapsable
                        label={
                          <>
                            <span className="overrides-label-panel">{t('item_editor.right_panel.copyright.title')}</span>
                            <Info content={t('item_editor.right_panel.copyright.info')} className="info" />
                          </>
                        }
                      >
                        <div className="right-panel-copyright-section">
                          <div className="right-panel-export-protection">
                            <span>{t('item_editor.right_panel.copyright.vrm_export')}</span>
                            <Checkbox
                              toggle
                              label={
                                (data as WearableData)?.blockVrmExport
                                  ? t('item_editor.right_panel.copyright.disabled')
                                  : t('item_editor.right_panel.copyright.enabled')
                              }
                              checked={!(data as WearableData)?.blockVrmExport}
                              onChange={this.handleAllowVrmExport}
                              aria-label={t('item_editor.right_panel.copyright.vrm_export')}
                            />
                          </div>
                        </div>
                      </Collapsable>
                    )}
                    {item?.type === ItemType.WEARABLE && (
                      <Collapsable
                        label={
                          <>
                            <span className="overrides-label-panel">{t('item_editor.right_panel.outline_compatible.title')}</span>
                            <Info content={t('item_editor.right_panel.outline_compatible.info')} className="info" />
                          </>
                        }
                      >
                        <div className="right-panel-copyright-section">
                          <div className="right-panel-export-protection">
                            <span>{t('item_editor.right_panel.outline_compatible.title')}</span>
                            <Checkbox
                              toggle
                              label={
                                (data as WearableData)?.outlineCompatible !== false
                                  ? t('item_editor.right_panel.copyright.enabled')
                                  : t('item_editor.right_panel.copyright.disabled')
                              }
                              checked={(data as WearableData)?.outlineCompatible !== false}
                              onChange={this.handleAllowOutlineCompatible}
                              aria-label={t('item_editor.right_panel.outline_compatible.title')}
                            />
                          </div>
                        </div>
                      </Collapsable>
                    )}
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
