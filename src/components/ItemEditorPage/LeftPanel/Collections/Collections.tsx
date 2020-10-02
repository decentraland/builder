import * as React from 'react'
import { Header, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionImage from 'components/CollectionImage'
import { locations } from 'routing/locations'
import { Props } from './Collections.types'
import './Collections.css'

export default class Collections extends React.PureComponent<Props> {
  render() {
    const { collections, items, onNavigate, selectedCollectionId, hasHeader } = this.props
    if (collections.length === 0) return null

    return (
      <Section className="Collections">
        {hasHeader ? <Header sub>{t('item_editor.left_panel.collections')}</Header> : null}
        {collections.map(collection => (
          <div
            key={collection.id}
            className={`collection ${collection.id === selectedCollectionId ? 'is-selected' : ''}`}
            onClick={() => onNavigate(locations.itemEditor({ collectionId: collection.id }))}
          >
            <CollectionImage collection={collection} />
            <div className="wrapper">
              <div className="name">{collection.name}</div>
              <div className="count">
                {t('item_editor.left_panel.items_count', { count: items.filter(item => item.collectionId === collection.id).length })}
              </div>
            </div>
          </div>
        ))}
      </Section>
    )
  }
}
