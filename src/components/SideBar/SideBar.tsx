import * as React from 'react'
import { Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import './SideBar.css'

export default class SideBar extends React.PureComponent {
  render() {
    return (
      <div className="SideBar">
        <Header size="medium">{t('sidebar.title')}</Header>
      </div>
    )
  }
}
