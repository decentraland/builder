import * as React from 'react'
import { Tabs } from 'decentraland-ui'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { LOCALSTORAGE_LAST_VISITED_SECTION_KEY } from 'components/HomePage/HomePage'
import { Props, NavigationTab } from './Navigation.types'

const localStorage = getLocalStorage()

export default class Navigation extends React.PureComponent<Props> {
  handleOnTabClick(path: string) {
    const { onNavigate } = this.props
    localStorage.setItem(LOCALSTORAGE_LAST_VISITED_SECTION_KEY, path)
    onNavigate(path)
  }

  render() {
    const { activeTab, isFullscreen, isCommitteeMember, children } = this.props
    return (
      <Tabs isFullscreen={isFullscreen}>
        {children}
        <Tabs.Tab active={activeTab === NavigationTab.OVERVIEW} onClick={() => this.handleOnTabClick(locations.root())}>
          {t('navigation.overview')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.COLLECTIONS} onClick={() => this.handleOnTabClick(locations.collections())}>
          {t('navigation.collections')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.SCENES} onClick={() => this.handleOnTabClick(locations.scenes())}>
          {t('navigation.scenes')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.LAND} onClick={() => this.handleOnTabClick(locations.land())}>
          {t('navigation.land')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.NAMES} onClick={() => this.handleOnTabClick(locations.ens())}>
          {t('navigation.names')}
        </Tabs.Tab>
        {isCommitteeMember ? (
          <Tabs.Tab active={activeTab === NavigationTab.CURATION} onClick={() => this.handleOnTabClick(locations.curation())}>
            {t('navigation.curation')}
          </Tabs.Tab>
        ) : null}
      </Tabs>
    )
  }
}
