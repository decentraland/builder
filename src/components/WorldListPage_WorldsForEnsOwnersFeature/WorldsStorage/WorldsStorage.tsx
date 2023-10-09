import React from 'react'
import classnames from 'classnames'
import { Progress } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { formatNumber } from 'decentraland-dapps/dist/lib/utils'
import { Props } from './WorldsStorage.types'
import styles from './WorldsStorage.module.css'
import { fromBytesToMegabytes } from '../utils'

export const CURRENT_MBS_TEST_ID = 'worlds-storage-current-mbs'
export const PROGRESS_TEST_ID = 'worlds-storage-bar-front'
export const WORLDS_STORAGE_TEST_ID = 'worlds-storage'

const WorldsStorage = ({ maxBytes, currentBytes, className, onViewDetails }: Props) => {
  const maxMbs = fromBytesToMegabytes(maxBytes)
  const currentMbs = fromBytesToMegabytes(currentBytes)
  const usedPercentage = (currentMbs * 100) / maxMbs

  return (
    <div data-testid={WORLDS_STORAGE_TEST_ID} className={classnames(styles.container, className)}>
      <span className={styles.used}>{t('worlds_list_page.worlds_storage.used')}</span>
      <div className={styles.description}>
        <span>{t('worlds_list_page.worlds_storage.description')}</span>{' '}
        <span className={styles.link} onClick={onViewDetails}>
          {t('worlds_list_page.worlds_storage.link')}
        </span>
      </div>
      <div className={styles.space}>
        <div data-testid={CURRENT_MBS_TEST_ID}>
          <span className={styles.current}>{formatNumber(currentMbs)}</span> / {formatNumber(maxMbs)} Mb
        </div>
        <Progress data-testid={PROGRESS_TEST_ID} percent={Math.trunc(usedPercentage)} className={styles.bar} size="small" />
      </div>
    </div>
  )
}

export default React.memo(WorldsStorage)
