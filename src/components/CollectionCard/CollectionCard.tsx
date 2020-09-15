import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'
import { locations } from 'routing/locations'
import CollectionImage from './CollectionImage'
import { Props } from './CollectionCard.types'
import './CollectionCard.css'

export default class CollectionCard extends React.PureComponent<Props> {
  render() {
    const { collection } = this.props

    return (
      <Card className="CollectionCard" link as={Link} to={locations.collectionDetail(collection.id)}>
        <CollectionImage collection={collection} />
        <Card.Content>
          <div className="text">{collection.name}</div>
        </Card.Content>
      </Card>
    )
  }
}
