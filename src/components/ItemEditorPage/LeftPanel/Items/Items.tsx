import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Popup, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ItemImage from 'components/ItemImage'
import { Item } from 'modules/item/types'
import { locations } from 'routing/locations'
import { Props } from './Items.types'
import './Items.css'
import { getMissingBodyShapeType } from 'modules/item/utils'

export default class Items extends React.PureComponent<Props> {
  hasValidRepresentation = (item: Item) => {
    const { bodyShape } = this.props
    return item.data.representations.some(representation => representation.bodyShape.includes(bodyShape))
  }

  isVisible = (item: Item) => {
    const { visibleItems } = this.props
    return visibleItems.some(_item => _item.id === item.id)
  }

  handleToggle = (item: Item) => {
    const { visibleItems, onSetItems } = this.props
    if (!this.hasValidRepresentation(item)) return

    const newVisibleItemIds = visibleItems.filter(_item => _item.id !== item.id)
    if (!this.isVisible(item)) {
      newVisibleItemIds.push(item)
    }
    onSetItems(newVisibleItemIds)
  }

  render() {
    const { items, selectedItemId, selectedCollectionId, hasHeader } = this.props
    if (items.length === 0) return null

    return (
      <Section className="Items">
        {hasHeader ? <Header sub>{t('item_editor.left_panel.items')}</Header> : null}
        {items.map(item => (
          <Link
            key={item.id}
            className={`item ${item.id === selectedItemId ? 'is-selected' : ''}`}
            to={locations.itemEditor({ itemId: item.id, collectionId: selectedCollectionId || undefined })}
          >
            <ItemImage item={item} />
            <div className="name">{item.name}</div>
            <Popup
              className="invalid-representation-popup"
              content={t('item_editor.left_panel.invalid_representation_tooltip', {
                bodyShape: <b>{t(`body_shapes.${getMissingBodyShapeType(item)}`).toLowerCase()}</b>
              })}
              disabled={this.hasValidRepresentation(item)}
              position="top center"
              trigger={
                <div className={`toggle ${this.isVisible(item) ? 'visible' : 'hidden'}`} onClick={() => this.handleToggle(item)}></div>
              }
            />
          </Link>
        ))}
      </Section>
    )
  }
}
