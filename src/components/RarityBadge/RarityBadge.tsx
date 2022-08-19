import React from 'react'
import classnames from 'classnames'
import { Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Rarity } from '@dcl/schemas'
import { Props } from './RarityBadge.types'
import styles from './RarityBadge.module.css'

const RarityBadge = ({ className, rarity, size, withTooltip }: Props) => {
  const trigger = (
    <div
      className={classnames([styles.badge, styles[size], className])}
      style={{
        backgroundColor: Rarity.getColor((rarity as unknown) as Rarity)
      }}
      title={!withTooltip ? t(`rarity_description.${rarity}`) : ''}
    >
      <span className={styles.text}>{t(`wearable.rarity.${rarity}`)}</span>
    </div>
  )

  return withTooltip ? <Popup position="top center" content={t(`rarity_description.${rarity}`)} trigger={trigger} /> : trigger
}

RarityBadge.defaultProps = {
  size: 'medium',
  withTooltip: true
}

export default React.memo(RarityBadge)
