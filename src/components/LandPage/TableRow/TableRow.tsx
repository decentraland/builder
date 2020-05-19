import * as React from 'react'
import { Table, Column, Row } from 'decentraland-ui'

import { LandType } from 'modules/land/types'
import { Atlas } from 'components/Atlas'
import Profile from 'components/Profile'
import InlineList from '../InlineList'
import { Props } from './TableRow.types'
import { coordsToId, getCoords, getCenter } from 'modules/land/utils'
import './TableRow.css'

export default class TableRow extends React.PureComponent<Props> {
  render() {
    const { land, projects } = this.props
    const coords = getCoords(land)
    const isEstate = land.type === LandType.ESTATE
    const [x, y] = !isEstate ? [coords.x, coords.y] : getCenter(land.parcels!)
    const selection = !isEstate ? [coords] : land.parcels!
    return (
      <Table.Row className="TableRow">
        <Table.Cell>
          <Row>
            <Column width={67} grow={false} shrink={false}>
              <Atlas x={x} y={y} width={45} height={45} isDraggable={false} size={9} selection={selection} isEstate={isEstate} />
            </Column>
            <Column className="name">{land.name}</Column>
          </Row>
        </Table.Cell>
        <Table.Cell>{coordsToId(x, y)}</Table.Cell>
        <Table.Cell className="capitalize">{land.role}</Table.Cell>
        <Table.Cell>
          <InlineList
            list={land.operators.map(operator => (
              <Profile address={operator} />
            ))}
          />
        </Table.Cell>
        <Table.Cell className="capitalize">{land.type}</Table.Cell>
        <Table.Cell>
          <InlineList list={projects.map(p => p.title)} />
        </Table.Cell>
      </Table.Row>
    )
  }
}
