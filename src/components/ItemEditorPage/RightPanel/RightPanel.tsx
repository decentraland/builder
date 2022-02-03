import * as React from 'react'
import equal from 'fast-deep-equal'
import { utils } from 'decentraland-commons'
import { Loader, Dropdown, Button } from 'decentraland-ui'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ItemImage from 'components/ItemImage'
import ItemProvider from 'components/ItemProvider'
import ConfirmDelete from 'components/ConfirmDelete'
import Icon from 'components/Icon'
import {
  getMissingBodyShapeType,
  canManageItem,
  getRarities,
  getWearableCategories,
  getOverridesCategories,
  isOwner,
  resizeImage
} from 'modules/item/utils'
import { isLocked } from 'modules/collection/utils'
import { computeHashes } from 'modules/deployment/contentUtils'
import {
  Item,
  ItemRarity,
  ITEM_DESCRIPTION_MAX_LENGTH,
  ITEM_NAME_MAX_LENGTH,
  THUMBNAIL_PATH,
  WearableCategory,
  WearableData
} from 'modules/item/types'
import Collapsable from './Collapsable'
import Input from './Input'
import Select from './Select'
import MultiSelect from './MultiSelect'
import Tags from './Tags'
import { Props, State } from './RightPanel.types'
import './RightPanel.css'

export default class RightPanel extends React.PureComponent<Props, State> {
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

  handleChangeCategory = (category: WearableCategory) => {
    let data: WearableData = {
      ...this.state.data!,
      category
    }
    // when changing the category to SKIN we hide everything else
    if (category === WearableCategory.SKIN) {
      data = this.setReplaces(data, [])
      data = this.setHides(data, [])
    }
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  setReplaces(data: WearableData, replaces: WearableCategory[]) {
    return {
      ...data,
      replaces,
      representations: data.representations.map(representation => ({
        ...representation,
        overrideReplaces: replaces
      }))
    }
  }

  handleChangeReplaces = (replaces: WearableCategory[]) => {
    const data = this.setReplaces(this.state.data!, replaces)
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  setHides(data: WearableData, hides: WearableCategory[]) {
    return {
      ...data,
      hides,
      representations: data.representations.map(representation => ({
        ...representation,
        overrideHides: hides
      }))
    }
  }

  handleChangeHides = (hides: WearableCategory[]) => {
    const data = this.setHides(this.state.data!, hides)
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
        data: data!,
        contents: itemContents
      }
      onSaveItem(item, contents)
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

  handleRemoveFromCollection = () => {
    const { selectedItem, onSetCollection } = this.props
    if (selectedItem) {
      onSetCollection(selectedItem, null)
    }
  }

  handleOpenThumbnailDialog = () => {
    if (this.thumbnailInput.current) {
      this.thumbnailInput.current.click()
    }
  }

  handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target

    if (files && files.length > 0) {
      const file = files[0]
      const resizedFile = await resizeImage(file)
      const thumbnail = URL.createObjectURL(resizedFile)

      this.setState({
        thumbnail,
        contents: { [THUMBNAIL_PATH]: file },
        isDirty: true
      })
    }
  }

  handleDownloadItem = () => {
    const { selectedItemId, onDownload } = this.props
    selectedItemId && onDownload(selectedItemId)
  }

  canEditItemMetadata(item: Item | null) {
    const { collection, address = '' } = this.props
    if (!item) {
      return false
    }
    if (collection && isLocked(collection)) {
      return false
    }
    return collection ? canManageItem(collection, item, address) : isOwner(item, address)
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
    const editableItemAttributes = ['name', 'description', 'rarity', 'data']
    return !equal(utils.pick<Item>(state, editableItemAttributes), utils.pick(item, editableItemAttributes))
  }

  asCategorySelect(values: WearableCategory[]) {
    return values.map(value => ({ value, text: t(`wearable.category.${value}`) }))
  }

  asRaritySelect(values: ItemRarity[]) {
    return values.map(value => ({ value, text: t(`wearable.rarity.${value}`) }))
  }

  render() {
    const { selectedItemId, address, isConnected, isDownloading, error } = this.props
    const { name, description, thumbnail, rarity, data, isDirty, hasItem } = this.state
    const rarities = getRarities()

    return (
      <div className="RightPanel">
        {isConnected ? (
          <ItemProvider id={selectedItemId}>
            {(item, collection, isLoading) => {
              const isItemLocked = collection && isLocked(collection)
              const canEditItemMetadata = this.canEditItemMetadata(item)

              let actionableCategories = item ? getOverridesCategories(item.contents, data?.category) : []
              const wearableCategories = item ? getWearableCategories(item.contents) : []

              let overrideCategories: WearableCategory[] = []
              let hidesCategories: WearableCategory[] = []
              let replaces: WearableCategory[] = []
              let hides: WearableCategory[] = []

              if (data) {
                hides = data.hides.filter(category => actionableCategories.includes(category))
                replaces = data.replaces.filter(category => actionableCategories.includes(category))
                hidesCategories = actionableCategories.filter(category => !replaces.includes(category))
                overrideCategories = actionableCategories.filter(category => !hides.includes(category))
              }

              const downloadButton = isDownloading ? (
                <Loader active size="tiny" className="donwload-item-loader" />
              ) : (
                <Icon name="export" className={`download-item-button`} onClick={this.handleDownloadItem} />
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
                                bodyShape: t(`body_shapes.${getMissingBodyShapeType(item)}`).toLowerCase()
                              })}
                              onClick={this.handleAddRepresentationToItem}
                            />
                          ) : null}
                          {item.collectionId ? (
                            <Dropdown.Item text={t('collection_item.remove_from_collection')} onClick={this.handleRemoveFromCollection} />
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
                  <Collapsable item={item} label={t('item_editor.right_panel.details')}>
                    {item => (
                      <div className="details">
                        {canEditItemMetadata ? (
                          <>
                            <Icon name="edit" className="edit-item-file" onClick={this.handleChangeItemFile} />
                            {downloadButton}
                            <div className="thumbnail-container">
                              <ItemImage item={item} src={thumbnail} hasBadge={true} badgeSize="small" />
                              <div className="thumbnail-edit-container">
                                <input
                                  type="file"
                                  ref={this.thumbnailInput}
                                  onChange={this.handleThumbnailChange}
                                  accept="image/png, image/jpeg"
                                />
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
                        <div className="metrics">
                          <div className="metric triangles">{t('model_metrics.triangles', { count: item.metrics.triangles })}</div>
                          <div className="metric materials">{t('model_metrics.materials', { count: item.metrics.materials })}</div>
                          <div className="metric textures">{t('model_metrics.textures', { count: item.metrics.textures })}</div>
                        </div>
                      </div>
                    )}
                  </Collapsable>
                  <Collapsable item={item} label={t('item_editor.right_panel.basics')}>
                    {item => (
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
                        <Select<WearableCategory>
                          itemId={item.id}
                          label={t('global.category')}
                          value={data!.category}
                          options={this.asCategorySelect(wearableCategories)}
                          disabled={!canEditItemMetadata}
                          onChange={this.handleChangeCategory}
                        />
                        <Select<ItemRarity>
                          itemId={item.id}
                          label={t('global.rarity')}
                          value={rarity}
                          options={this.asRaritySelect(rarities)}
                          disabled={item.isPublished || !canEditItemMetadata}
                          onChange={this.handleChangeRarity}
                        />
                      </>
                    )}
                  </Collapsable>
                  <Collapsable item={item} label={t('item_editor.right_panel.overrides')}>
                    {item => (
                      <>
                        <MultiSelect<WearableCategory>
                          itemId={item.id}
                          label={t('item_editor.right_panel.replaces')}
                          info={t('item_editor.right_panel.replaces_info')}
                          value={replaces}
                          options={this.asCategorySelect(overrideCategories)}
                          disabled={!canEditItemMetadata || this.isSkin()}
                          onChange={this.handleChangeReplaces}
                        />
                        <MultiSelect<WearableCategory>
                          itemId={item.id}
                          label={t('item_editor.right_panel.hides')}
                          info={t('item_editor.right_panel.hides_info')}
                          value={hides}
                          options={this.asCategorySelect(hidesCategories)}
                          disabled={!canEditItemMetadata}
                          onChange={this.handleChangeHides}
                        />
                      </>
                    )}
                  </Collapsable>
                  <Collapsable item={item} label={t('item_editor.right_panel.tags')}>
                    {item => (
                      <Tags itemId={item.id} value={data!.tags} onChange={this.handleChangeTags} isDisabled={!canEditItemMetadata} />
                    )}
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
