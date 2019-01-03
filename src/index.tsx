import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import WalletProvider from 'decentraland-dapps/dist/providers/WalletProvider'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'

import { store, history } from 'modules/common/store'
import { Routes } from 'routing/Routes'

import './themes'
import './index.css'

ReactDOM.render(
  <Provider store={store}>
    <WalletProvider>
      <TranslationProvider locales={['en']}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </TranslationProvider>
    </WalletProvider>
  </Provider>,
  document.getElementById('root')
)
