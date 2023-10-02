import React from 'react'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, TabType } from './NameTabs.types'
import { useCurrentlySelectedTab } from '../hooks'

export const TAB_QUERY_PARAM_KEY = 'tab'

const NameTabs = ({ onNavigate }: Props) => {
  const { tab, pathname, urlSearchParams } = useCurrentlySelectedTab()

  const navigateToTab = (tab: TabType) => {
    const urlSearchParamsCopy = new URLSearchParams(urlSearchParams)
    urlSearchParamsCopy.set(TAB_QUERY_PARAM_KEY, tab)
    onNavigate(`${pathname}?${urlSearchParamsCopy.toString()}`)
  }

  if (!tab) {
    navigateToTab(TabType.DCL)
    return null
  }

  return (
    <Tabs>
      <Tabs.Tab active={tab === TabType.DCL} onClick={() => navigateToTab(TabType.DCL)}>
        {t('worlds_list_page.name_tabs.dcl_names')}
      </Tabs.Tab>
      <Tabs.Tab active={tab === TabType.ENS} onClick={() => navigateToTab(TabType.ENS)}>
        {t('worlds_list_page.name_tabs.ens_names')}
      </Tabs.Tab>
    </Tabs>
  )
}

export default React.memo(NameTabs)
