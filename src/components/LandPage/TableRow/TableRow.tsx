import * as React from 'react'
import { Table, Column, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { isEqual } from 'lib/address'
import { Atlas } from 'components/Atlas'
import Profile from 'components/Profile'
import RentalPeriod from 'components/RentalPeriod'
import InlineList from '../InlineList'
import { coordsToId, getCoords, LAND_POOL_ADDRESS } from 'modules/land/utils'
import { Props } from './TableRow.types'
import './TableRow.css'

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
    const { land, deployments, rental, onNavigate } = this.props
    const { x, y } = getCoords(land)

    return (
      <Table.Row className="TableRow" onClick={() => onNavigate(locations.landDetail(land.id))}>
        <Table.Cell>
          <Row>
            <Column width={67} grow={false} shrink={false}>
              <Atlas landId={land.id} width={45} height={45} isDraggable={false} size={9} />
            </Column>
            <Column className="name">
              <div>
                {land.name} <span className="secondary-text">{coordsToId(x, y)}</span>
              </div>
            </Column>
          </Row>
        </Table.Cell>
        <Table.Cell>
          <div>
            {t(`roles.${land.role}`)}
            &nbsp;
            {rental ? <RentalPeriod land={land} rental={rental} /> : null}
          </div>
        </Table.Cell>
        <Table.Cell>
          <InlineList
            list={land.operators.sort(sortLandPoolLast).map(operator => (
              <Profile address={operator} />
            ))}
          />
        </Table.Cell>
        <Table.Cell>
          <InlineList list={deployments.map(deployment => deployment.name)} />
        </Table.Cell>
      </Table.Row>
    )
  }
}
