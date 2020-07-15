import * as React from 'react'
import { Table, Column, Row } from 'decentraland-ui'

import { Atlas } from 'components/Atlas'
import Profile from 'components/Profile'
import InlineList from '../InlineList'
import { Props } from './TableRow.types'
import { coordsToId, getCoords, LAND_POOL_ADDRESS } from 'modules/land/utils'
import './TableRow.css'
import { isEqual } from 'lib/address'
import { locations } from 'routing/locations'

const sortLandPoolLast = (a: string, b: string) => {
  if (isEqual(a, LAND_POOL_ADDRESS)) {
    return 1
  } else if (isEqual(b, LAND_POOL_ADDRESS)) {
    return -1
  }
  return a > b ? 1 : -1
}

export default class TableRow extends React.PureComponent<Props> {
  render() {
    const { land, projects, onNavigate } = this.props
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
        <Table.Cell>
          <InlineList
            list={land.operators.sort(sortLandPoolLast).map(operator => (
              <Profile address={operator} />
            ))}
          />
        </Table.Cell>
        <Table.Cell>
          <InlineList list={projects.map(p => p.title)} />
        </Table.Cell>
      </Table.Row>
    )
  }
}
