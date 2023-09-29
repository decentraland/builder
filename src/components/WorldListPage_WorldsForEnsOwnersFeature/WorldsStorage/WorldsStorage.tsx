import React from 'react'
import { Props } from './WorldsStorage.types'
import styles from './WorldsStorage.module.css'
import classNames from 'classnames'

const WorldsStorage = ({ maxBytes, currentBytes: currentBytes }: Props) => {
  const maxMbs = BigInt(maxBytes) / BigInt(1000000)
  const currentMbs = BigInt(currentBytes) / BigInt(1000000)
  const usedPercentage = (currentMbs * BigInt(100)) / maxMbs

  return (
    <div className={styles.worldsStorage}>
      <div className={styles.spaceContainer}>
        <span>Space used</span>
        <div>
          <span className={styles.currentMbs}>{currentMbs.toString()}</span> / {maxMbs.toString()} mb
        </div>
      </div>
      <div className={styles.barContainer}>
        <div className={classNames(styles.bar, styles.barBehind)} />
        <div
          style={{
            width: `${usedPercentage}%`
          }}
          className={classNames(styles.bar, styles.barFront)}
        />
      </div>
      <div className={styles.viewDetails}>view details</div>
    </div>
  )
}

export default React.memo(WorldsStorage)
