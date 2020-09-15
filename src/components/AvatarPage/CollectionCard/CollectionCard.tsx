import * as React from 'react'
import { DropTarget } from 'react-dnd'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { collect, CollectedProps, collectionTarget } from './CollectionCard.dnd'
import { ITEM_DASHBOARD_CARD_SOURCE } from '../ItemCard/ItemCard.dnd'
import CollectionImage from 'components/CollectionImage'
import { Props } from './CollectionCard.types'
import './CollectionCard.css'

class CollectionCard extends React.PureComponent<Props & CollectedProps> {
  render() {
    const { collection, connectDropTarget, isOver } = this.props

    return connectDropTarget(
      <div className={`CollectionCard is-card ${isOver ? 'is-over' : ''}`}>
        <Link to={locations.collectionDetail(collection.id)}>
          <CollectionImage collection={collection} />
          <Card.Content>
            <div className="text">{collection.name}</div>
          </Card.Content>
        </Link>
      </div>
    )
  }
}

export default DropTarget<Props, CollectedProps>(ITEM_DASHBOARD_CARD_SOURCE, collectionTarget, collect)(CollectionCard)
