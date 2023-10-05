import React from 'react'
import classnames from 'classnames'
import { Progress } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
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
    <div data-testid={WORLDS_STORAGE_TEST_ID} className={classnames(styles.worldsStorage, className)}>
      <div className={styles.spaceContainer}>
        <span>{t('worlds_list_page.worlds_storage.space_used')}</span>
        <div data-testid={CURRENT_MBS_TEST_ID}>
          <span className={styles.currentMbs}>{currentMbs.toFixed(2)}</span> / {maxMbs.toFixed(2)} Mb
        </div>
      </div>
      <Progress data-testid={PROGRESS_TEST_ID} percent={Math.trunc(usedPercentage)} className={styles.bar} size="small" />
      <div className={styles.viewDetailsContainer}>
        <span className={styles.viewDetails} onClick={onViewDetails}>
          {t('worlds_list_page.worlds_storage.view_details')}
        </span>
      </div>
    </div>
  )
}

export default React.memo(WorldsStorage)
