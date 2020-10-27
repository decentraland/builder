import * as React from 'react'
import { Link } from 'react-router-dom'
import { DropTarget } from 'react-dnd'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionImage from 'components/CollectionImage'
import { locations } from 'routing/locations'
import { SIDEBAR_ITEM_SOURCE } from '../../Items/SidebarItem/SidebarItem.dnd'
import { Props } from './SidebarCollection.types'
import { collect, CollectedProps, collectionTarget } from './SidebarCollection.dnd'
import CollectionBadge from 'components/CollectionBadge'
import './SidebarCollection.css'

class SidebarCollection extends React.PureComponent<Props & CollectedProps> {
  render() {
    const { collection, items, isSelected, connectDropTarget, isOver, canDrop } = this.props
    return connectDropTarget(
      <div className={`SidebarCollection ${isSelected ? 'is-selected' : ''} ${isOver ? (canDrop ? 'is-over' : 'no-drop') : ''}`}>
        <Link to={locations.itemEditor({ collectionId: collection.id })}>
          <CollectionImage collection={collection} />
          <div className="wrapper">
            <div className="name">
              {collection.name}
              <CollectionBadge collection={collection} />
            </div>
            <div className="count">
              {t('item_editor.left_panel.items_count', { count: items.filter(item => item.collectionId === collection.id).length })}
            </div>
          </div>
        </Link>
      </div>
    )
  }
}

export default DropTarget<Props, CollectedProps>(SIDEBAR_ITEM_SOURCE, collectionTarget, collect)(SidebarCollection)
