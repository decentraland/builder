import * as React from 'react'
import { env } from 'decentraland-commons'
import { default as DappApp } from 'decentraland-dapps/dist/containers/App'
import Intercom from 'decentraland-dapps/dist/components/Intercom'

import * as languages from 'modules/translation/languages'
import { Props } from './App.types'

const APP_ID = env.get('REACT_APP_INTERCOM_APP_ID', '')

export default class App extends React.PureComponent<Props> {
  render() {
    const { children } = this.props
    return (
      <DappApp activePage="builder" locales={Object.keys(languages)}>
        <div id="App">
          {children}
          <Intercom appId={APP_ID} />
        </div>
      </DappApp>
    )
  }
}
