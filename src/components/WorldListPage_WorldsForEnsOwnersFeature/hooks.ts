import { useLocation } from 'react-router'
import { TabType } from './NameTabs/NameTabs.types'
import { TAB_QUERY_PARAM_KEY } from './NameTabs/NameTabs'

export type UseCurrentlySelectedTabResult = {
  tab?: TabType
  pathname: string
  urlSearchParams: URLSearchParams
}

export const useCurrentlySelectedTab = (): UseCurrentlySelectedTabResult => {
  const location = useLocation()
  const urlSearchParams = new URLSearchParams(location.search)
  const tab = urlSearchParams.get(TAB_QUERY_PARAM_KEY)

  const result: UseCurrentlySelectedTabResult = {
    urlSearchParams,
    pathname: location.pathname
  }

  switch (tab) {
    case 'dcl':
      result.tab = TabType.DCL
      break
    case 'ens':
      result.tab = TabType.ENS
      break
  }

  return result
}
