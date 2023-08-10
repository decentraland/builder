import { Link, useLocation } from 'react-router-dom'
import { Center } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import './SignInRequired.css'

export default function SignInRequired() {
  const location = useLocation()
  return (
    <Center className="SignInRequired">
      <div className="secondary-text">
        <T id="global.sign_in_required" values={{ link: <Link to={locations.signIn(location.pathname)}>{t('global.sign_in')}</Link> }} />
      </div>
    </Center>
  )
}
