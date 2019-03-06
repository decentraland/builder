import * as React from 'react'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'

import { Props } from './UnsupportedBrowserPage.types'
import './UnsupportedBrowserPage.css'

export default class UnsupportedBrowserPage extends React.PureComponent<Props> {
  componentDidMount() {
    const analytics = getAnalytics()
    document.body.classList.add('notfound-body')
    analytics.track('Not found page', {})
  }

  componentWillUnmount() {
    document.body.classList.remove('notfound-body')
  }

  handleOnClick = () => {
    this.props.onNavigate(locations.root())
  }

  render() {
    return (
      <div className="UnsupportedBrowserPage">
        <h1 className="title">{t('unsupported_browser_page.title')}</h1>
        <p className="subtitle">
          <T
            id="unsupported_browser_page.subtitle"
            values={{
              br: <br />,
              chrome: <a href="https://www.google.com/chrome/">Google Chrome</a>,
              firefox: <a href="https://www.google.com/chrome/">Mozilla Firefox</a>
            }}
          />
        </p>
      </div>
    )
  }
}
