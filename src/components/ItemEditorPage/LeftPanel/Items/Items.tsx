import * as React from 'react'
import { Header, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ItemImage from 'components/ItemImage'
import { locations } from 'routing/locations'
import { Props } from './Items.types'
import './Items.css'

export default class Items extends React.PureComponent<Props> {
  render() {
    const { items, onNavigate, selectedItemId, selectedCollectionId, hasHeader } = this.props
    if (items.length === 0) return null

    return (
      <Section className="Items">
        {hasHeader ? <Header sub>{t('item_editor.left_panel.items')}</Header> : null}
        {items.map(item => (
          <div
            key={item.id}
            className={`item ${item.id === selectedItemId ? 'is-selected' : ''}`}
            onClick={
              item.id === selectedItemId
                ? undefined
                : () => onNavigate(locations.itemEditor({ itemId: item.id, collectionId: selectedCollectionId || undefined }))
            }
          >
            <ItemImage item={item} />
            <div className="name">{item.name}</div>
          </div>
        ))}
      </Section>
    )
  }
}
