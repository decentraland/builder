import React from 'react'
import { Table } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import ItemImage from 'components/ItemImage'
import ItemStatus from 'components/ItemStatus'
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
        <Table.Cell width={3}>{t('global.item')}</Table.Cell>
        <Table.Cell width={3}>-</Table.Cell>
        <Table.Cell width={2}>-</Table.Cell>
      </Table.Row>
    )
  }
}
