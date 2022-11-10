import * as React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ItemImage from 'components/ItemImage'
import ItemStatus from 'components/ItemStatus'
import { ItemType } from 'modules/item/types'
import { getMissingBodyShapeType, hasBodyShape } from 'modules/item/utils'
import { locations } from 'routing/locations'
import { Props } from './SidebarItem.types'
import './SidebarItem.css'

class SidebarItem extends React.PureComponent<Props> {
  handleClick = () => {
    const { item, onClick } = this.props
    onClick(item)
  }

  renderToggleItem() {
    const { item, isVisible, isPlayingEmote } = this.props
    if (item.type === ItemType.EMOTE) {
      return <Icon className="toggle-emote" name={isVisible && isPlayingEmote ? 'pause' : 'play'} onClick={this.handleClick} />
    } else {
      return <div className={`toggle ${isVisible ? 'is-visible' : 'is-hidden'}`} onClick={this.handleClick}></div>
    }
  }

  render() {
    const { item, isSelected, selectedCollectionId, bodyShape } = this.props
    return (
      <div className={`SidebarItem ${isSelected ? 'is-selected' : ''}`}>
        <Link to={locations.itemEditor({ itemId: item.id, collectionId: selectedCollectionId || undefined })}>
          <ItemImage item={item} />
          <div className="name">
            <ItemStatus item={item} />
            {item.name}
          </div>
          <Popup
            content={t('item_editor.left_panel.invalid_representation_tooltip', {
              bodyShape: <b>{t(`body_shapes.${getMissingBodyShapeType(item)!}`).toLowerCase()}</b>
            })}
            disabled={hasBodyShape(item, bodyShape)}
            position="top center"
            trigger={this.renderToggleItem()}
          />
        </Link>
      </div>
    )
  }
}

export default SidebarItem
