import * as React from 'react'
import { Tabs } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, NavigationTab } from './Navigation.types'
import { locations } from 'routing/locations'

export default class Navigation extends React.PureComponent<Props> {
  render() {
    const { activeTab, onNavigate, children } = this.props
    return (
      <Tabs>
        {children}
        <Tabs.Tab active={activeTab === NavigationTab.SCENES} onClick={() => onNavigate(locations.root())}>
          {t('navigation.scenes')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.LAND} onClick={() => onNavigate(locations.land())}>
          {t('navigation.land')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.AVATAR} onClick={() => onNavigate(locations.avatar())}>
          {t('navigation.avatar')}
        </Tabs.Tab>
      </Tabs>
    )
  }
}
