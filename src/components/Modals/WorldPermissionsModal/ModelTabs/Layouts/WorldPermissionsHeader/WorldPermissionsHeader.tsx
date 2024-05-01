import React from 'react'

import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import { Props } from './WorldPermissionsHeader.types'
import styles from './WorldPermissionsHeader.module.css'

export const WORLD_PERMISSIONS_HEADER_TEXT_DATA_TEST_ID = 'world-permissions-header-text-data-test-id'

export const WorldPermissionsHeader = React.memo((props: Props) => {
  const { description, loading } = props

  return loading ? (
    <LoadingText type="p" size="full"></LoadingText>
  ) : (
    <p data-testid={WORLD_PERMISSIONS_HEADER_TEXT_DATA_TEST_ID} className={styles.header}>
      {description}
    </p>
  )
})
