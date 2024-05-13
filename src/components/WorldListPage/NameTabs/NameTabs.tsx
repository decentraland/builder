import React from 'react'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './NameTabs.types'
import { TAB_QUERY_PARAM_KEY, TabType, useCurrentlySelectedTab } from '../hooks'

const NameTabs = ({ isWorldContributorEnabled, onNavigate }: Props) => {
  const { tab, pathname, urlSearchParams } = useCurrentlySelectedTab()

  const navigateToTab = (tab: TabType) => {
    const urlSearchParamsCopy = new URLSearchParams(urlSearchParams)
    urlSearchParamsCopy.set(TAB_QUERY_PARAM_KEY, tab)
    onNavigate(`${pathname}?${urlSearchParamsCopy.toString()}`)
  }

  if (!tab || (tab === TabType.CONTRIBUTOR && !isWorldContributorEnabled)) {
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
      {isWorldContributorEnabled && (
        <Tabs.Tab active={tab === TabType.CONTRIBUTOR} onClick={() => navigateToTab(TabType.CONTRIBUTOR)}>
          {t('worlds_list_page.name_tabs.contributor_names')}
        </Tabs.Tab>
      )}
    </Tabs>
  )
}

export default React.memo(NameTabs)
