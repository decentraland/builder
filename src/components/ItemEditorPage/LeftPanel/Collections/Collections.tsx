import * as React from 'react'
import { Header, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionImage from 'components/CollectionImage'
import { locations } from 'routing/locations'
import { Props } from './Collections.types'
import './Collections.css'
import { Link } from 'react-router-dom'

export default class Collections extends React.PureComponent<Props> {
  render() {
    const { collections, items, selectedCollectionId, hasHeader } = this.props
    if (collections.length === 0) return null

    return (
      <Section className="Collections">
        {hasHeader ? <Header sub>{t('item_editor.left_panel.collections')}</Header> : null}
        {collections.map(collection => (
          <Link
            to={locations.itemEditor({ collectionId: collection.id })}
            key={collection.id}
            className={`collection ${collection.id === selectedCollectionId ? 'is-selected' : ''}`}
          >
            <CollectionImage collection={collection} />
            <div className="wrapper">
              <div className="name">{collection.name}</div>
              <div className="count">
                {t('item_editor.left_panel.items_count', { count: items.filter(item => item.collectionId === collection.id).length })}
              </div>
            </div>
          </Link>
        ))}
      </Section>
    )
  }
}
