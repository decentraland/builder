import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Popup, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ItemImage from 'components/ItemImage'
import { Item } from 'modules/item/types'
import { locations } from 'routing/locations'
import { getMissingBodyShapeType, hasBodyShape } from 'modules/item/utils'
import { Props } from './Items.types'
import './Items.css'

export default class Items extends React.PureComponent<Props> {
  isVisible = (item: Item) => {
    const { visibleItems } = this.props
    return visibleItems.some(_item => _item.id === item.id)
  }

  handleToggle = (item: Item) => {
    const { visibleItems, onSetItems, bodyShape } = this.props
    if (!hasBodyShape(item, bodyShape)) return

    const newVisibleItemIds = visibleItems.filter(_item => _item.id !== item.id)
    if (!this.isVisible(item)) {
      newVisibleItemIds.push(item)
    }
    onSetItems(newVisibleItemIds)
  }

  render() {
    const { items, selectedItemId, selectedCollectionId, hasHeader, bodyShape } = this.props
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
              disabled={hasBodyShape(item, bodyShape)}
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
