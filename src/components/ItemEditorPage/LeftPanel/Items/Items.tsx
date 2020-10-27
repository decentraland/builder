import * as React from 'react'
import { Header, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Item } from 'modules/item/types'
import { hasBodyShape } from 'modules/item/utils'
import { Props } from './Items.types'
import './Items.css'
import SidebarItem from './SidebarItem'

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
          <SidebarItem
            item={item}
            isSelected={selectedItemId === item.id}
            isVisible={this.isVisible(item)}
            selectedCollectionId={selectedCollectionId}
            bodyShape={bodyShape}
            onClick={this.handleToggle}
          />
        ))}
      </Section>
    )
  }
}
