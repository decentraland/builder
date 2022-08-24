import * as React from 'react'
import { Link } from 'react-router-dom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionImage from 'components/CollectionImage'
import { locations } from 'routing/locations'
import { Props } from './SidebarCollection.types'
import CollectionStatus from 'components/CollectionStatus'
import './SidebarCollection.css'

class SidebarCollection extends React.PureComponent<Props> {
  render() {
    const { collection, items, isSelected } = this.props
    const collectionItems = items.filter(item => item.collectionId === collection.id).sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    const itemId = collectionItems.length > 0 ? collectionItems[0].id : undefined
    return (
      <div className={`SidebarCollection ${isSelected ? 'is-selected' : ''}`}>
        <Link to={locations.itemEditor({ collectionId: collection.id, itemId })}>
          <CollectionImage collectionId={collection.id} />
          <div className="wrapper">
            <div className="name">
              <CollectionStatus collection={collection} />
              {collection.name}
            </div>
            <div className="count">{t('item_editor.left_panel.items_count', { count: collection.itemCount })}</div>
          </div>
        </Link>
      </div>
    )
  }
}

export default SidebarCollection
