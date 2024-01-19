import { useLocation } from 'react-router'

export const TAB_QUERY_PARAM_KEY = 'tab'

export enum TabType {
  DCL = 'dcl',
  ENS = 'ens'
}

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
