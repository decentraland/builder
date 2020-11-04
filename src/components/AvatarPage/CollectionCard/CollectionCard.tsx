import * as React from 'react'
import { DropTarget } from 'react-dnd'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { collect, CollectedProps, collectionTarget } from './CollectionCard.dnd'
import { ITEM_DASHBOARD_CARD_SOURCE } from '../ItemCard/ItemCard.dnd'
import CollectionImage from 'components/CollectionImage'
import CollectionBadge from 'components/CollectionBadge'
import { Props } from './CollectionCard.types'
import './CollectionCard.css'

class CollectionCard extends React.PureComponent<Props & CollectedProps> {
  render() {
    const { collection, items, connectDropTarget, isOver, canDrop } = this.props

    return connectDropTarget(
      <div className={`CollectionCard is-card ${isOver && canDrop ? 'is-over' : ''}`}>
        <Link to={locations.collectionDetail(collection.id)}>
          <CollectionImage collection={collection} />
          <Card.Content>
            <div className="text" title={collection.name}>
              {collection.name} <CollectionBadge collection={collection} />
            </div>
            <div className="subtitle">{t('collection_card.subtitle', { count: items.length })}</div>
          </Card.Content>
        </Link>
      </div>
    )
  }
}

export default DropTarget<Props, CollectedProps>(ITEM_DASHBOARD_CARD_SOURCE, collectionTarget, collect)(CollectionCard)
