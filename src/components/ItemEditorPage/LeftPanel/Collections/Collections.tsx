import * as React from 'react'
import { Header, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import SidebarCollection from './SidebarCollection'
import { Props } from './Collections.types'
import './Collections.css'
import { sortByName } from 'lib/sort'

export default class Collections extends React.PureComponent<Props> {
  render() {
    const { collections, items, selectedCollectionId, hasHeader, onSetCollection } = this.props
    if (collections.length === 0) return null

    return (
      <Section className="Collections">
        {hasHeader ? <Header sub>{t('item_editor.left_panel.collections')}</Header> : null}
        {collections.sort(sortByName).map(collection => (
          <SidebarCollection
            key={collection.id}
            collection={collection}
            items={items}
            isSelected={collection.id === selectedCollectionId}
            onSetCollection={onSetCollection}
          />
        ))}
      </Section>
    )
  }
}
