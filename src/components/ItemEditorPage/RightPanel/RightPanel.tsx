import * as React from 'react'
import equal from 'fast-deep-equal'
import { utils } from 'decentraland-commons'
import { Loader, Dropdown, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ItemImage from 'components/ItemImage'
import ItemProvider from 'components/ItemProvider'
import ConfirmDelete from 'components/ConfirmDelete'
import Icon from 'components/Icon'
import { isEqual } from 'lib/address'
import { getMissingBodyShapeType, canManageItem, getRarities, getCategories } from 'modules/item/utils'
import { computeHashes } from 'modules/deployment/contentUtils'
import { Item, ItemRarity, ITEM_DESCRIPTION_MAX_LENGTH, ITEM_NAME_MAX_LENGTH, THUMBNAIL_PATH, WearableCategory } from 'modules/item/types'
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
    } else if (!prevProps.selectedItem && selectedItem) {
      this.setItem(selectedItem)
    }
  }

  setItem(item: Item) {
    this.setState({
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
    onOpenModal('CreateItemModal', { item: selectedItem, addRepresentation: true })
  }

  handleChangeItemFile = () => {
    const { selectedItem, onOpenModal } = this.props
    onOpenModal('CreateItemModal', { item: selectedItem, changeItemFile: true })
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
    const data = {
      ...this.state.data!,
      category
    }
    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  handleChangeReplaces = (replaces: WearableCategory[]) => {
    const data = {
      ...this.state.data!,
      replaces,
      representations: this.state.data!.representations.map(representation => ({
        ...representation,
        overrideReplaces: replaces
      }))
    }

    this.setState({ data, isDirty: this.isDirty({ data }) })
  }

  handleChangeHides = (hides: WearableCategory[]) => {
    const data = {
      ...this.state.data!,
      hides,
      representations: this.state.data!.representations.map(representation => ({
        ...representation,
        overrideHides: hides
      }))
    }

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
    const { selectedItem, onSaveItem, onSavePublishedItem } = this.props
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
      const onSave = selectedItem && selectedItem.isPublished ? onSavePublishedItem : onSaveItem
      onSave(item, contents)
      this.setState({ isDirty: false })
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

    const MAX_THUMBNAIL_SIZE = 5000000

    if (files && files.length > 0) {
      const file = files[0]
      if (file.size > MAX_THUMBNAIL_SIZE) {
        alert(
          t('asset_pack.edit_assetpack.errors.thumbnail_size', {
            count: MAX_THUMBNAIL_SIZE
          })
        )
        return
      }
      const thumbnail = URL.createObjectURL(file)

      this.setState({
        thumbnail,
        contents: { [THUMBNAIL_PATH]: file },
        isDirty: true
      })
    }
  }

  canEditItemMetadata(item: Item | null) {
    const { collection, address = '' } = this.props
    return (item && collection && canManageItem(collection, item, address)) || (!collection && this.isOwner(item))
  }

  isOwner(item: Item | null) {
    const { address = '' } = this.props
    return item && isEqual(item.owner, address)
  }

  isDirty(newState: Partial<State> = {}) {
    const { hasItem } = this.state

    const editableItemAttributes = ['name', 'description', 'rarity', 'data']
    const stateItem = utils.pick<Item>({ ...this.state, ...newState }, editableItemAttributes)
    const item = utils.pick(this.props.selectedItem!, editableItemAttributes)

    return hasItem ? !equal(stateItem, item) : false
  }

  render() {
    const { selectedItemId } = this.props
    const { name, description, thumbnail, rarity, data, isDirty, hasItem } = this.state
    const rarities = getRarities()

    return (
      <div className="RightPanel">
        <ItemProvider id={selectedItemId}>
          {(item, _collection, isLoading) => {
            const isOwner = this.isOwner(item)
            const canEditItemMetadata = this.canEditItemMetadata(item)

            const categories = item ? getCategories(item.contents) : []
            const isItemLoading = selectedItemId && (!item || !hasItem)

            return isLoading || isItemLoading ? (
              <Loader size="massive" active />
            ) : (
              <>
                <div className="header">
                  <div className="title">{t('item_editor.right_panel.properties')}</div>
                  {isOwner && item && !item.isPublished ? (
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
                        <ConfirmDelete name={name} onDelete={this.handleDeleteItem} trigger={<Dropdown.Item text={t('global.delete')} />} />
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
                        <ItemImage item={item} src={thumbnail} hasBadge={true} badgeSize="small" />
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
                        options={categories.map(value => ({ value, text: t(`wearable.category.${value}`) }))}
                        disabled={!canEditItemMetadata}
                        onChange={this.handleChangeCategory}
                      />
                      <Select<ItemRarity>
                        itemId={item.id}
                        label={t('global.rarity')}
                        value={rarity}
                        options={rarities.map(value => ({ value, text: t(`wearable.rarity.${value}`) }))}
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
                        value={data!.replaces}
                        options={categories.map(value => ({ value, text: t(`wearable.category.${value}`) }))}
                        disabled={!canEditItemMetadata}
                        onChange={this.handleChangeReplaces}
                      />
                      <MultiSelect<WearableCategory>
                        itemId={item.id}
                        label={t('item_editor.right_panel.hides')}
                        info={t('item_editor.right_panel.hides_info')}
                        value={data!.hides}
                        options={categories.map(value => ({ value, text: t(`wearable.category.${value}`) }))}
                        disabled={!canEditItemMetadata}
                        onChange={this.handleChangeHides}
                      />
                    </>
                  )}
                </Collapsable>
                <Collapsable item={item} label={t('item_editor.right_panel.tags')}>
                  {item => <Tags itemId={item.id} value={data!.tags} onChange={this.handleChangeTags} isDisabled={!canEditItemMetadata} />}
                </Collapsable>
                {isDirty ? (
                  <div className="edit-buttons">
                    <Button secondary onClick={this.handleOnResetItem}>
                      {t('global.cancel')}
                    </Button>
                    <Button primary onClick={this.handleOnSaveItem}>
                      {t('global.submit')}
                    </Button>
                  </div>
                ) : null}
              </>
            )
          }}
        </ItemProvider>
      </div>
    )
  }
}
