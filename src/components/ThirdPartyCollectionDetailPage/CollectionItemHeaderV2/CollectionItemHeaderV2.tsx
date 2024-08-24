import classNames from 'classnames'
import { MappingType } from '@dcl/schemas'
import { Checkbox, Grid, InfoTooltip } from 'decentraland-ui'
import allIcon from '../../../icons/all.svg'
import multipleIcon from '../../../icons/multiple.svg'
import singleIcon from '../../../icons/single.svg'
import rangeIcon from '../../../icons/range.svg'
import lightbulbIcon from '../../../icons/lightbulb.svg'
import { Props } from './CollectionItemHeaderV2.types'
import { t } from 'decentraland-dapps/dist/modules/translation'
import styles from './CollectionItemHeaderV2.module.css'

const mappingTypeIcons = {
  [MappingType.ANY]: allIcon,
  [MappingType.MULTIPLE]: multipleIcon,
  [MappingType.SINGLE]: singleIcon,
  [MappingType.RANGE]: rangeIcon
}

const LinkingTooltipMappingType = ({ type }: { type: MappingType }) => {
  return (
    <>
      <div className={styles.gridItem}>
        <div className={styles.mappingType}>
          <img className={styles.mappingIcon} src={mappingTypeIcons[type]} />
          {t(`mapping_editor.mapping_types.${type}`)}
        </div>
      </div>
      <div className={classNames(styles.gridItem, styles.mappingDescription)}>
        <div>{t(`mapping_editor.mapping_descriptions.${type}`)}</div>
        {type !== MappingType.ANY && <div className={styles.mappingExample}>{t(`mapping_editor.mapping_examples.${type}`)}</div>}
      </div>
    </>
  )
}

const LinkingTooltipContent = () => (
  <div className={styles.linkedTooltip}>
    <div className={styles.tooltipHeader}>
      <img src={lightbulbIcon} />
      {t('collection_row.linking_tooltip.title')}
    </div>
    <LinkingTooltipMappingType type={MappingType.ANY} />
    <LinkingTooltipMappingType type={MappingType.SINGLE} />
    <LinkingTooltipMappingType type={MappingType.MULTIPLE} />
    <LinkingTooltipMappingType type={MappingType.RANGE} />
  </div>
)

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
          <InfoTooltip>
            <LinkingTooltipContent />
          </InfoTooltip>
        </Grid.Column>
        <Grid.Column width={3}> {t('collection_row.status')} </Grid.Column>
        <Grid.Column width={1}></Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
