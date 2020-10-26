import * as React from 'react'
import { Table, Column, Row } from 'decentraland-ui'

import { Atlas } from 'components/Atlas'
import Profile from 'components/Profile'
import { Props } from './TableRow.types'
import { coordsToId, getCoords } from 'modules/land/utils'
import './TableRow.css'
import { locations } from 'routing/locations'

export default class TableRow extends React.PureComponent<Props> {
  render() {
    const { land, onNavigate } = this.props
    const coords = getCoords(land)
    return (
      <Table.Row className="TableRow" onClick={() => onNavigate(locations.landDetail(land.id))}>
        <Table.Cell>
          <Row>
            <Column width={67} grow={false} shrink={false}>
              <Atlas landId={land.id} width={45} height={45} isDraggable={false} size={9} />
            </Column>
            <Column className="name">{land.name}</Column>
          </Row>
        </Table.Cell>
        <Table.Cell>{coordsToId(coords.x, coords.y)}</Table.Cell>
        <Table.Cell>
          <Profile address={land.owner} />
        </Table.Cell>
      </Table.Row>
    )
  }
}
