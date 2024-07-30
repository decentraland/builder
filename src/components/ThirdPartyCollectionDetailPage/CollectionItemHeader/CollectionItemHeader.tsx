import { Checkbox, Grid } from 'decentraland-ui'
import { Props } from './CollectionItemHeader.types'
import { t } from 'decentraland-dapps/dist/modules/translation'

export const CollectionItemHeader = ({ areAllSelected, onSelectedAllClick }: Props) => {
  return (
    <Grid columns="equal" className="grid-header secondary-text">
      <Grid.Row>
        <Grid.Column width={5} className="item-column">
          <Checkbox className="item-checkbox" checked={areAllSelected} onClick={onSelectedAllClick} />
          &nbsp;
          {t('global.item')}
        </Grid.Column>
        <Grid.Column>{t('global.category')}</Grid.Column>
        <Grid.Column>{t('global.body_shape')}</Grid.Column>
        <Grid.Column>URN ID</Grid.Column>
        <Grid.Column width={3}> {t('collection_row.status')} </Grid.Column>
        <Grid.Column width={1}></Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
