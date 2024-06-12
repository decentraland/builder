import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { DragDropContextProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import ModalProvider from 'decentraland-dapps/dist/providers/ModalProvider'
import ToastProvider from 'decentraland-dapps/dist/providers/ToastProvider'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import WalletProvider from 'decentraland-dapps/dist/providers/WalletProvider'

import { store, history } from 'modules/common/store'
import * as modals from 'components/Modals'
import * as languages from 'modules/translation/languages'
import Routes from 'routing'

import './modules/analytics/track'
import './modules/analytics/sentry'
import './themes'
import './index.css'

ReactDOM.render(
  <Provider store={store}>
    <DragDropContextProvider backend={HTML5Backend}>
      <TranslationProvider locales={Object.keys(languages)}>
        <WalletProvider>
          <Router history={history}>
            <ModalProvider components={modals}>
              <ToastProvider>
                <Routes />
              </ToastProvider>
            </ModalProvider>
          </Router>
        </WalletProvider>
      </TranslationProvider>
    </DragDropContextProvider>
  </Provider>,
  document.getElementById('root')
)
