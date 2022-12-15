import React from 'react'
import { Table } from 'decentraland-ui'
import { locations } from 'routing/locations'
import ItemImage from 'components/ItemImage'
import ItemStatus from 'components/ItemStatus'
import { formatDistanceToNow } from 'lib/date'
import { Props } from './ItemRow.types'
import styles from './ItemRow.module.css'

export default class ItemRow extends React.PureComponent<Props> {
  handleTableRowClick = () => {
    const { onNavigate, item } = this.props
    onNavigate(locations.itemDetail(item.id))
  }

  render() {
    const { item } = this.props

    return (
      <Table.Row className={styles.ItemRow} onClick={this.handleTableRowClick}>
        <Table.Cell width={4}>
          <div className={styles.imageColumn}>
            <ItemImage className={styles.image} item={item} />
            <div className={styles.title}>
              <ItemStatus item={item} />
              <div className={styles.name}>{item.name}</div>
            </div>
          </div>
        </Table.Cell>
        <Table.Cell width={3}>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</Table.Cell>
        <Table.Cell width={3}>{formatDistanceToNow(item.updatedAt, { addSuffix: true })}</Table.Cell>
      </Table.Row>
    )
  }
}
