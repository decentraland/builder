import React, { useState, useCallback, useEffect } from 'react'
import { EnhancedIntercom } from 'decentraland-dapps/dist/containers/EnhancedIntercom'
import { getAnalytics, getAnonymousId } from 'decentraland-dapps/dist/modules/analytics/utils'
import { config } from 'config'
import { IntercomUserData } from './Intercom.types'

const APP_ID = config.get('INTERCOM_APP_ID', '')
const analytics = getAnalytics()

export const Intercom: React.FC = () => {
  const [intercomUserData, setIntercomUserData] = useState<IntercomUserData>()

  const analyticsReadyCallback = useCallback(() => {
    const dclAnonymousUserID = getAnonymousId()
    if (dclAnonymousUserID) {
      // Bail out with the same reference when the id didn't change: returning a new object here
      // re-triggers the effect below and loops render -> ready() -> setState forever.
      setIntercomUserData(current => (current?.anon_id === dclAnonymousUserID ? current : { ...current, anon_id: dclAnonymousUserID }))
    }
  }, [])

  useEffect(() => {
    analytics?.ready(analyticsReadyCallback)
  }, [analyticsReadyCallback])

  return <EnhancedIntercom appId={APP_ID} data={intercomUserData} settings={{ alignment: 'right' }} />
}

export default Intercom
