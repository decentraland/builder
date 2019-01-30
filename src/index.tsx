import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import WalletProvider from 'decentraland-dapps/dist/providers/WalletProvider'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import ModalProvider from 'decentraland-dapps/dist/providers/ModalProvider'

import { store, history } from 'modules/common/store'
import * as modals from 'components/Modals'
import * as languages from 'modules/translation/languages'
import { Routes } from 'routing/Routes'

import './themes'
import './index.css'

ReactDOM.render(
  <Provider store={store}>
    <WalletProvider>
      <TranslationProvider locales={Object.keys(languages)}>
        <ModalProvider components={modals}>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </ModalProvider>
      </TranslationProvider>
    </WalletProvider>
  </Provider>,
  document.getElementById('root')
)
