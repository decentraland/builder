import * as React from 'react'
import { Header, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { sortByName } from 'lib/sort'
import { Item } from 'modules/item/types'
import { hasBodyShape } from 'modules/item/utils'
import SidebarItem from './SidebarItem'
import { Props } from './Items.types'
import './Items.css'

export default class Items extends React.PureComponent<Props> {
  isVisible = (item: Item) => {
    const { visibleItems } = this.props
    return visibleItems.some(_item => _item.id === item.id)
  }

  handleClick = (item: Item) => {
    const { visibleItems, onSetItems, bodyShape } = this.props
    if (!hasBodyShape(item, bodyShape)) return

    const newVisibleItemIds = visibleItems.filter(_item => _item.id !== item.id)
    if (!this.isVisible(item)) {
      newVisibleItemIds.push(item)
    }
    onSetItems(newVisibleItemIds)
  }

  handleToggle = (item: Item, isSelected: boolean) => {
    const { onToggleThirdPartyItem } = this.props
    onToggleThirdPartyItem(item.id, isSelected)
  }

  render() {
    const { items, selectedItemId, selectedCollectionId, selectedThirdPartyItemIds, hasHeader, bodyShape } = this.props
    if (items.length === 0) return null

    return (
      <Section className="Items">
        {hasHeader ? <Header sub>{t('item_editor.left_panel.items')}</Header> : null}
        {items.sort(sortByName).map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            isVisible={this.isVisible(item)}
            isChecked={selectedThirdPartyItemIds.includes(item.id)}
            selectedCollectionId={selectedCollectionId}
            bodyShape={bodyShape}
            onClick={this.handleClick}
            onToggle={this.handleToggle}
          />
        ))}
      </Section>
    )
  }
}
