import { Checkbox, Grid } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation'
import { LinkingToTooltip } from 'components/LinkedToTooltip'
import { Props } from './CollectionItemHeaderV2.types'
import styles from './CollectionItemHeaderV2.module.css'

export const CollectionItemHeaderV2 = ({ areAllSelected, onSelectedAllClick }: Props) => {
  return (
    <Grid columns="equal" className={styles.gridHeader}>
      <Grid.Row>
        <Grid.Column width={4} className={styles.itemColumn}>
          <Checkbox className={styles.itemCheckbox} checked={areAllSelected} onClick={onSelectedAllClick} />
          &nbsp;
          {t('global.item')}
        </Grid.Column>
        <Grid.Column className={styles.linkedToColumn}>
          <span>{t('third_party_collection_detail_page.linked_to')}</span>
          <LinkingToTooltip />
        </Grid.Column>
        <Grid.Column width={3}> {t('collection_row.status')} </Grid.Column>
        <Grid.Column width={1}></Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
