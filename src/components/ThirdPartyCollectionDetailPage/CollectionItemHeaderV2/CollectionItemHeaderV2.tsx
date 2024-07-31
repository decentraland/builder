import { Checkbox, Grid } from 'decentraland-ui'
import { Props } from './CollectionItemHeaderV2.types'
import { t } from 'decentraland-dapps/dist/modules/translation'

export const CollectionItemHeaderV2 = ({ areAllSelected, onSelectedAllClick }: Props) => {
  return (
    <Grid columns="equal" className="grid-header secondary-text">
      <Grid.Row>
        <Grid.Column width={4} className="item-column">
          <Checkbox className="item-checkbox" checked={areAllSelected} onClick={onSelectedAllClick} />
          &nbsp;
          {t('global.item')}
        </Grid.Column>
        <Grid.Column>Linked to</Grid.Column>
        <Grid.Column width={2}> {t('collection_row.status')} </Grid.Column>
        <Grid.Column width={1}></Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
