import * as React from 'react'
import { Link } from 'react-router-dom'
import { DragSource } from 'react-dnd'
import { Popup, Checkbox, CheckboxProps } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isThirdParty } from 'lib/urn'
import ItemImage from 'components/ItemImage'
import ItemStatus from 'components/ItemStatus'
import { getMissingBodyShapeType, hasBodyShape } from 'modules/item/utils'
import { locations } from 'routing/locations'
import { collect, CollectedProps, sidebarItemSource, SIDEBAR_ITEM_SOURCE } from './SidebarItem.dnd'
import { Props } from './SidebarItem.types'
import './SidebarItem.css'

class SidebarItem extends React.PureComponent<Props & CollectedProps> {
  handleCheckboxChange = (_event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) => {
    const { item, onToggle } = this.props
    onToggle(item, data.checked!)
  }

  handleClick = () => {
    const { item, onClick } = this.props
    onClick(item)
  }

  render() {
    const { item, isSelected, isVisible, isChecked, selectedCollectionId, bodyShape, connectDragSource, isDragging } = this.props
    return connectDragSource(
      <div className={`SidebarItem ${isSelected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`}>
        {selectedCollectionId && isThirdParty(item.urn) ? <Checkbox checked={isChecked} onClick={this.handleCheckboxChange} /> : null}
        <Link to={locations.itemEditor({ itemId: item.id, collectionId: selectedCollectionId || undefined })}>
          <ItemImage item={item} />
          <div className="name">
            <ItemStatus item={item} />
            {item.name}
          </div>
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
