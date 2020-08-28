import * as React from 'react'

import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import NotFound from 'components/NotFound'
import { Props } from './ItemDetailPage.types'
import './ItemDetailPage.css'

export default class ItemDetailPage extends React.PureComponent<Props> {
  renderPage() {
    const { item } = this.props
    return item === null ? <NotFound /> : <div>{item.name}</div>
  }

  render() {
    const { isLoading } = this.props
    return (
      <LoggedInDetailPage className="ItemDetailPage" activeTab={NavigationTab.AVATAR} isLoading={isLoading}>
        {this.renderPage()}
      </LoggedInDetailPage>
    )
  }
}
