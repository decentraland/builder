import React, { useState, useCallback, useEffect } from 'react'
import IntercomWidget from 'decentraland-dapps/dist/components/Intercom'
import { getAnalytics, getAnonymousId } from 'decentraland-dapps/dist/modules/analytics/utils'
import { config } from 'config'

const APP_ID = config.get('INTERCOM_APP_ID', '')
const analytics = getAnalytics()

export const Intercom: React.FC = () => {
  const [dclAnonymousUserID, setDclAnonymousUserID] = useState('')

  const analyticsReadyCallback = useCallback(() => {
    const dclAnonymousUserID = getAnonymousId()
    if (dclAnonymousUserID) {
      setDclAnonymousUserID(dclAnonymousUserID)
    }
  }, [])

  useEffect(() => {
    analytics.ready(analyticsReadyCallback)
  }, [analyticsReadyCallback])

  return dclAnonymousUserID ? (
    <IntercomWidget appId={APP_ID} data={{ anonymous_id: dclAnonymousUserID }} settings={{ alignment: 'right' }} />
  ) : null
}

export default Intercom
