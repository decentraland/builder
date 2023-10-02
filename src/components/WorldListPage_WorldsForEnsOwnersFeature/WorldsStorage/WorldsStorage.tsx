import React from 'react'
import { Progress } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './WorldsStorage.types'
import styles from './WorldsStorage.module.css'

export const CURRENT_MBS_TEST_ID = 'worlds-storage-current-mbs'
export const PROGRESS_TEST_ID = 'worlds-storage-bar-front'

const WorldsStorage = ({ maxBytes, currentBytes }: Props) => {
  const maxMbs = maxBytes / 1000000
  const currentMbs = currentBytes / 1000000
  const usedPercentage = (currentMbs * 100) / maxMbs

  return (
    <div className={styles.worldsStorage}>
      <div className={styles.spaceContainer}>
        <span>{t('worlds_list_page.worlds_storage.space_used')}</span>
        <div data-testid={CURRENT_MBS_TEST_ID}>
          <span className={styles.currentMbs}>{currentMbs.toFixed(2)}</span> / {maxMbs.toFixed(2)} mb
        </div>
      </div>
      <Progress data-testid={PROGRESS_TEST_ID} percent={Math.trunc(usedPercentage)} className={styles.bar} size="small" />
      <div className={styles.viewDetails}>{t('worlds_list_page.worlds_storage.view_details')}</div>
    </div>
  )
}

export default React.memo(WorldsStorage)
