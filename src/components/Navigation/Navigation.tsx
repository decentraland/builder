import * as React from 'react'
import { Tabs } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, NavigationTab } from './Navigation.types'
import { locations } from 'routing/locations'

export default class Navigation extends React.PureComponent<Props> {
  render() {
    const { activeTab, onNavigate, isFullscreen, children } = this.props
    return (
      <Tabs isFullscreen={isFullscreen}>
        {children}
        <Tabs.Tab active={activeTab === NavigationTab.SCENES} onClick={() => onNavigate(locations.root())}>
          {t('navigation.scenes')}
        </Tabs.Tab>
        <Tabs.Tab active={activeTab === NavigationTab.LAND} onClick={() => onNavigate(locations.land())}>
          {t('navigation.land')}
        </Tabs.Tab>
        {env.get('REACT_APP_FF_WEARABLES') ? (
          <Tabs.Tab active={activeTab === NavigationTab.AVATAR} onClick={() => onNavigate(locations.avatar())}>
            {t('navigation.avatar')}
          </Tabs.Tab>
        ) : null}
      </Tabs>
    )
  }
}
