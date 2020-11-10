import React from 'react'
import { NavigationTab } from 'components/Navigation/Navigation.types'

export type Props = {
  children: React.ReactNode
  activeTab?: NavigationTab
  className?: string
  hasNavigation?: boolean
  isPageFullscreen?: boolean
  isFooterFullscreen?: boolean
  isNavigationFullscreen?: boolean
  isLoading?: boolean
  isLoggingIn: boolean
  isLoggedIn: boolean
}

export type MapStateProps = Pick<Props, 'isLoggingIn' | 'isLoggedIn'>
