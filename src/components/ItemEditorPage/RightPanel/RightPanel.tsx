import * as React from 'react'
import { Loader, Dropdown, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ItemImage from 'components/ItemImage'
import ItemProvider from 'components/ItemProvider'
import ConfirmDelete from 'components/ConfirmDelete'
import BuilderIcon from 'components/Icon'
import { isEqual } from 'lib/address'
import { getMissingBodyShapeType, canManageItem } from 'modules/item/utils'
import { Item, ItemRarity, ITEM_DESCRIPTION_MAX_LENGTH, ITEM_NAME_MAX_LENGTH, WearableCategory } from 'modules/item/types'
import Collapsable from './Collapsable'
import Input from './Input'
import Select from './Select'
import MultiSelect from './MultiSelect'
import Tags from './Tags'
import { Props, State } from './RightPanel.types'
import './RightPanel.css'

export default class RightPanel extends React.PureComponent<Props, State> {
  state: State = { item: null, isDirty: false }

  componentDidUpdate = (prevProps: Props) => {
    const { item } = this.state
    const { selectedItemId, selectedItem } = this.props

    if (item && prevProps.selectedItemId !== selectedItemId) {
      return this.setState({ item: null, isDirty: false })
    }

    if (!item && selectedItem) {
      return this.setState({ item: selectedItem, isDirty: false })
    }
  }

  handleDeleteItem = () => {
    const { onDeleteItem } = this.props
    const { item } = this.state
    onDeleteItem(item!)
  }

  handleAddRepresentationToItem = () => {
    const { onOpenModal } = this.props
    const { item } = this.state
    onOpenModal('CreateItemModal', { item, addRepresentation: true })
  }

  handleChangeItemFile = () => {
    const { onOpenModal } = this.props
    const { item } = this.state
    onOpenModal('CreateItemModal', { item, changeItemFile: true })
  }

  handleChange = (newItem: Item) => {
    this.setState({ item: newItem, isDirty: true })
  }

  handleOnSaveItem = () => {
    const { selectedItem, onSaveItem, onSavePublishedItem } = this.props
    const { item } = this.state

    if (item) {
      if (selectedItem && selectedItem.isPublished) {
        onSavePublishedItem(item)
      } else {
        onSaveItem(item, {})
      }
      this.setState({ isDirty: false })
    }
  }

  handleOnResetItem = () => {
    const { selectedItem } = this.props
    return this.setState({ item: selectedItem, isDirty: false })
  }

  handleRemoveFromCollection = () => {
    const { onSetCollection } = this.props
    const { item } = this.state
    if (item) {
      onSetCollection(item, null)
    }
  }

  canEditItemMetadata(item: Item) {
    const { collection, address = '' } = this.props
    return (item && collection && canManageItem(collection, item, address)) || (!collection && this.isOwner(item))
  }

  isOwner(item: Item) {
    const { address = '' } = this.props
    return item && isEqual(item.owner, address)
  }

  render() {
    const { selectedItemId } = this.props
    const { item: selectedItem, isDirty } = this.state

    const categories = Object.values(WearableCategory)
    const rarities = Object.values(ItemRarity)

    return (
      <div className="RightPanel">
        <ItemProvider id={selectedItemId}>
          {(remoteItem, _collection, isLoading) => {
            const item = (selectedItem || remoteItem) as Item
            const isOwner = this.isOwner(item)
            const canEditItemMetadata = this.canEditItemMetadata(item)

            return isLoading || (!remoteItem && selectedItemId) ? (
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
                        <ConfirmDelete
                          name={item.name}
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
                      {canEditItemMetadata && <BuilderIcon name="edit" className="edit-item-file" onClick={this.handleChangeItemFile} />}
                      <ItemImage item={item} hasBadge={true} badgeSize="small" />
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
                        value={item.name}
                        disabled={!canEditItemMetadata}
                        maxLength={ITEM_NAME_MAX_LENGTH}
                        onChange={name => this.handleChange({ ...item, name })}
                      />
                      <Input
                        itemId={item.id}
                        label={t('global.description')}
                        value={item.description}
                        disabled={!canEditItemMetadata}
                        maxLength={ITEM_DESCRIPTION_MAX_LENGTH}
                        onChange={description => this.handleChange({ ...item, description })}
                      />
                      <Select<WearableCategory>
                        itemId={item.id}
                        label={t('global.category')}
                        value={item.data.category}
                        options={categories.map(value => ({ value, text: t(`wearable.category.${value}`) }))}
                        disabled={!canEditItemMetadata}
                        onChange={category => this.handleChange({ ...item, data: { ...item.data, category } })}
                      />
                      <Select<ItemRarity>
                        itemId={item.id}
                        label={t('global.rarity')}
                        value={item.rarity}
                        options={rarities.map(value => ({ value, text: t(`wearable.rarity.${value}`) }))}
                        disabled={item.isPublished || !canEditItemMetadata}
                        onChange={rarity => this.handleChange({ ...item, rarity })}
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
                        value={item.data.replaces}
                        options={categories.map(value => ({ value, text: t(`wearable.category.${value}`) }))}
                        disabled={!canEditItemMetadata}
                        onChange={replaces =>
                          this.handleChange({
                            ...item,
                            data: {
                              ...item.data,
                              replaces,
                              representations: item.data.representations.map(representation => ({
                                ...representation,
                                overrideReplaces: replaces
                              }))
                            }
                          })
                        }
                      />
                      <MultiSelect<WearableCategory>
                        itemId={item.id}
                        label={t('item_editor.right_panel.hides')}
                        value={item.data.hides}
                        options={categories.map(value => ({ value, text: t(`wearable.category.${value}`) }))}
                        disabled={!canEditItemMetadata}
                        onChange={hides =>
                          this.handleChange({
                            ...item,
                            data: {
                              ...item.data,
                              hides,
                              representations: item.data.representations.map(representation => ({
                                ...representation,
                                overrideHides: hides
                              }))
                            }
                          })
                        }
                      />
                    </>
                  )}
                </Collapsable>
                <Collapsable item={item} label={t('item_editor.right_panel.tags')}>
                  {item => (
                    <Tags
                      itemId={item.id}
                      value={item.data.tags}
                      onChange={tags => this.handleChange({ ...item, data: { ...item.data, tags } })}
                      isDisabled={!canEditItemMetadata}
                    />
                  )}
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
