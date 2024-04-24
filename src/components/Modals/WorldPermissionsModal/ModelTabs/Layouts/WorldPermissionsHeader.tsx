import React from 'react'

import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'

import styles from './WorldPermissionsHeader.module.css'

type WorldPermissionsHeaderProps = {
  description: React.ReactNode
  loading: boolean
}

export default React.memo(function WorldPermissionsHeader(props: WorldPermissionsHeaderProps) {
  const { description, loading } = props

  return (
    <>
      {loading && <LoadingText type="p" size="full"></LoadingText>}
      {!loading && <p className={styles.header}>{description}</p>}
    </>
  )
})
