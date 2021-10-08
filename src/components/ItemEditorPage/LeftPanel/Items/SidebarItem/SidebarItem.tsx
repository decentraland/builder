import * as React from 'react'
import { Link } from 'react-router-dom'
import { Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ItemImage from 'components/ItemImage'
import ItemStatus from 'components/ItemStatus'
import { getMissingBodyShapeType, hasBodyShape } from 'modules/item/utils'
import { locations } from 'routing/locations'
import { collect, CollectedProps, sidebarItemSource, SIDEBAR_ITEM_SOURCE } from './SidebarItem.dnd'
import { Props } from './SidebarItem.types'
import './SidebarItem.css'
import { DragSource } from 'react-dnd'

class SidebarItem extends React.PureComponent<Props & CollectedProps> {
  handleClick = () => {
    const { item, onClick } = this.props
    onClick(item)
  }

  render() {
    const { item, isSelected, isVisible, selectedCollectionId, bodyShape, connectDragSource, isDragging } = this.props
    return connectDragSource(
      <div className={`SidebarItem ${isSelected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`}>
        <Link to={locations.itemEditor({ itemId: item.id, collectionId: selectedCollectionId || undefined })}>
          <ItemImage item={item} />
          <div className="name"><ItemStatus item={item} />{item.name}</div>
          <Popup
            content={t('item_editor.left_panel.invalid_representation_tooltip', {
              bodyShape: <b>{t(`body_shapes.${getMissingBodyShapeType(item)}`).toLowerCase()}</b>
            })}
            disabled={hasBodyShape(item, bodyShape)}
            position="top center"
            trigger={<div className={`toggle ${isVisible ? 'is-visible' : 'is-hidden'}`} onClick={this.handleClick}></div>}
          />
        </Link>
      </div>
    )
  }
}

export default DragSource<Props, CollectedProps>(SIDEBAR_ITEM_SOURCE, sidebarItemSource, collect)(SidebarItem)
