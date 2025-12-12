import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import ModalProvider from 'decentraland-dapps/dist/providers/ModalProvider'
import ToastProvider from 'decentraland-dapps/dist/providers/ToastProvider'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import { Web2TransactionModal } from 'decentraland-dapps/dist/containers'
import WalletProvider from 'decentraland-dapps/dist/providers/WalletProvider'
import { darkTheme, DclThemeProvider } from 'decentraland-ui2'

import { store, history } from 'modules/common/store'
import * as modals from 'components/Modals'
import * as languages from 'modules/translation/languages'
import Routes from 'routing'

import './modules/analytics/track'
import './modules/analytics/sentry'
import './themes'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element')
const root = createRoot(container)

root.render(
  <Provider store={store}>
    <DndProvider backend={HTML5Backend}>
      <TranslationProvider locales={Object.keys(languages)}>
        <WalletProvider>
          <ConnectedRouter history={history}>
            <DclThemeProvider theme={darkTheme}>
              <ToastProvider>
                <ModalProvider components={modals}>
                  <Routes />
                </ModalProvider>
              </ToastProvider>
              <Web2TransactionModal />
            </DclThemeProvider>
          </ConnectedRouter>
        </WalletProvider>
      </TranslationProvider>
    </DndProvider>
  </Provider>
)
