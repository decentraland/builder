import React from 'react'

import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'

type WorldPermissionsHeaderProps = {
  title: string
  description: string
  loading: boolean
}

export default React.memo(function WorldPermissionsHeader(props: WorldPermissionsHeaderProps) {
  const { title, description, loading } = props

  return (
    <>
      {loading && <LoadingText type="h1" size="small"></LoadingText>}
      {!loading && <h1>{title}</h1>}
      {loading && <LoadingText type="p" size="full"></LoadingText>}
      {!loading && <p>{description}</p>}
      {loading && <LoadingText type="p" size="full"></LoadingText>}
    </>
  )
})
