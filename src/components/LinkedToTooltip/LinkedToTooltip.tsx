import classNames from 'classnames'
import { InfoTooltip } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation'
import { MappingType } from '@dcl/schemas'
import allIcon from '../../icons/all.svg'
import multipleIcon from '../../icons/multiple.svg'
import singleIcon from '../../icons/single.svg'
import rangeIcon from '../../icons/range.svg'
import lightbulbIcon from '../../icons/lightbulb.svg'
import styles from './LinkedToTooltip.module.css'
import { Props } from './LinkedToToolip.types'

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

export const LinkingToTooltip = ({ className }: Props) => (
  <InfoTooltip className={className}>
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
  </InfoTooltip>
)
