import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { DragDropContextProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import ModalProvider from 'decentraland-dapps/dist/providers/ModalProvider'
import ToastProvider from 'decentraland-dapps/dist/providers/ToastProvider'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import WalletProvider from 'decentraland-dapps/dist/providers/WalletProvider'
import * as SingleSignOn from '@dcl/single-sign-on-client'

import { store, history } from 'modules/common/store'
import * as modals from 'components/Modals'
import { config } from 'config'
import * as languages from 'modules/translation/languages'
import Routes from 'routing'

import './modules/analytics/track'
import './modules/analytics/rollbar'
import './themes'
import './index.css'

SingleSignOn.init(config.get('SSO_URL'))

ReactDOM.render(
  <Provider store={store}>
    <DragDropContextProvider backend={HTML5Backend}>
      <TranslationProvider locales={Object.keys(languages)}>
        <WalletProvider>
          <ConnectedRouter history={history}>
            <ModalProvider components={modals}>
              <ToastProvider>
                <Routes />
              </ToastProvider>
            </ModalProvider>
          </ConnectedRouter>
        </WalletProvider>
      </TranslationProvider>
    </DragDropContextProvider>
  </Provider>,
  document.getElementById('root')
)
