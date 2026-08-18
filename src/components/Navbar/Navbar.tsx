import React, { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar2 as BaseNavbar } from 'decentraland-dapps/dist/containers/Navbar'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'
import { config } from 'config/index'
import AnnouncementBar, { isAnnouncementBarDismissed } from 'components/AnnouncementBar'
import { locations } from 'routing/locations'
import { Props } from './Navbar.types'

const Navbar: React.FC<Props> = ({ address, ...props }: Props) => {
  const { pathname, search } = useLocation()

  // Credits and MANA balances are only relevant while publishing collections.
  const showBalances = useMemo(() => pathname.startsWith(locations.collections()), [pathname])

  const [isAnnouncementBarVisible, setIsAnnouncementBarVisible] = useState(() => !isAnnouncementBarDismissed())

  const handleAnnouncementBarDismiss = useCallback(() => setIsAnnouncementBarVisible(false), [])

  const identity = useMemo(() => {
    if (address) {
      return localStorageGetIdentity(address) ?? undefined
    }
    return undefined
  }, [address])

  const handleOnSignIn = useCallback(() => {
    const searchParams = new URLSearchParams(search)
    const currentRedirectTo = searchParams.get('redirectTo')
    const basename = /^decentraland.(zone|org|today)$/.test(window.location.host) ? '/builder' : ''
    const redirectTo = !currentRedirectTo ? `${basename}${pathname}${search}` : `${basename}${currentRedirectTo}`

    window.location.replace(`${config.get('AUTH_URL')}/login?redirectTo=${redirectTo}`)
  }, [])

  return (
    // The fixed navbar is taller than the space its own container reserves, so
    // this gap is what keeps page content from sliding underneath it. The
    // announcement bar already provides that separation while it is showing.
    <div style={{ marginBottom: isAnnouncementBarVisible ? 0 : 36 }}>
      <BaseNavbar
        {...props}
        withChainSelector
        withNotifications
        withCredits={showBalances}
        showManaBalancesInNavbar={showBalances}
        activePage="create"
        identity={identity}
        onSignIn={handleOnSignIn}
      />
      {isAnnouncementBarVisible && <AnnouncementBar onDismiss={handleAnnouncementBarDismiss} />}
    </div>
  )
}

export default React.memo(Navbar)
