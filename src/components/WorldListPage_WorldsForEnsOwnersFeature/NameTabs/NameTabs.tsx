import React from 'react'
import { useLocation } from 'react-router'
import { Tabs } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, TabType } from './NameTabs.types'

const TAB_QUERY_PARAM_KEY = 'tab'

const NameTabs = ({ onNavigate }: Props) => {
  const location = useLocation()

  const urlSearchParams = new URLSearchParams(location.search)
  const tab = urlSearchParams.get(TAB_QUERY_PARAM_KEY)

  const navigateToTab = (tab: TabType) => {
    urlSearchParams.set(TAB_QUERY_PARAM_KEY, tab)
    onNavigate(`${location.pathname}?${urlSearchParams.toString()}`)
  }

  if (tab !== TabType.DCL && tab !== TabType.ENS) {
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
