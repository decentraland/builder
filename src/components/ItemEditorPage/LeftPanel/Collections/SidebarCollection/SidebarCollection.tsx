import * as React from 'react'
import { Link } from 'react-router-dom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionImage from 'components/CollectionImage'
import { locations } from 'routing/locations'
import { Props } from './SidebarCollection.types'
import './SidebarCollection.css'

export default class SidebarCollection extends React.PureComponent<Props> {
  render() {
    const { collection, items, isSelected } = this.props
    return (
      <Link
        to={locations.itemEditor({ collectionId: collection.id })}
        key={collection.id}
        className={`collection ${isSelected ? 'is-selected' : ''}`}
      >
        <CollectionImage collection={collection} />
        <div className="wrapper">
          <div className="name">{collection.name}</div>
          <div className="count">
            {t('item_editor.left_panel.items_count', { count: items.filter(item => item.collectionId === collection.id).length })}
          </div>
        </div>
      </Link>
    )
  }
}
