import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { Tabs } from 'decentraland-ui'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { LOCALSTORAGE_LAST_VISITED_SECTION_KEY } from 'components/HomePage/HomePage'
import { Props, NavigationTab } from './Navigation.types'

const localStorage = getLocalStorage()

export default function Navigation({ activeTab, isFullscreen, isCommitteeMember, children }: Props) {
  const history = useHistory()
  const handleOnTabClick = useCallback((path: string) => {
    localStorage.setItem(LOCALSTORAGE_LAST_VISITED_SECTION_KEY, path)
    history.push(path)
  }, [])

  return (
    <div className="Navigation">
      <Tabs isFullscreen={isFullscreen}>
        {children}
        <Tabs.Tab active={activeTab === NavigationTab.OVERVIEW} onClick={() => handleOnTabClick(locations.root())}>
          {t('navigation.overview')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.COLLECTIONS} onClick={() => handleOnTabClick(locations.collections())}>
          {t('navigation.collections')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.SCENES} onClick={() => handleOnTabClick(locations.scenes())}>
          {t('navigation.scenes')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.LAND} onClick={() => handleOnTabClick(locations.land())}>
          {t('navigation.land')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.NAMES} onClick={() => handleOnTabClick(locations.ens())}>
          {t('navigation.names')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.WORLDS} onClick={() => handleOnTabClick(locations.worlds())}>
          {t('navigation.worlds')}
        </Tabs.Tab>
        {isCommitteeMember ? (
          <Tabs.Tab active={activeTab === NavigationTab.CURATION} onClick={() => handleOnTabClick(locations.curation())}>
            {t('navigation.curation')}
          </Tabs.Tab>
        ) : null}
      </Tabs>
    </div>
  )
}
