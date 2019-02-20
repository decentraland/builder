import * as React from 'react'
import { default as DappApp } from 'decentraland-dapps/dist/containers/App'

import * as languages from 'modules/translation/languages'
import { Props } from './App.types'

export default class App extends React.PureComponent<Props> {
  render() {
    const { children } = this.props
    return (
      <DappApp activePage="builder" locales={Object.keys(languages)}>
        {children}
      </DappApp>
    )
  }
}
