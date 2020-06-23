import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { DragDropContextProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { Page, Center } from 'decentraland-ui'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import ModalProvider from 'decentraland-dapps/dist/providers/ModalProvider'
import WalletProvider from 'decentraland-dapps/dist/providers/WalletProvider'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { store, history } from 'modules/common/store'
import * as modals from 'components/Modals'
import * as languages from 'modules/translation/languages'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'

import './modules/analytics/track'
import './modules/analytics/rollbar'
import './modules/analytics/hotjar'
import './themes'
import './index.css'

const Maintenance = () => (
  <>
    <Navbar />
    <Page>
      <Center className="secondary-text">
        🚧&nbsp;&nbsp;
        {t('maintenance')}
        &nbsp;&nbsp;🚧
      </Center>
    </Page>
    <Footer />
  </>
)

ReactDOM.render(
  <Provider store={store}>
    <DragDropContextProvider backend={HTML5Backend}>
      <TranslationProvider locales={Object.keys(languages)}>
        <WalletProvider>
          <ModalProvider components={modals}>
            <ConnectedRouter history={history}>
              <Maintenance />
            </ConnectedRouter>
          </ModalProvider>
        </WalletProvider>
      </TranslationProvider>
    </DragDropContextProvider>
  </Provider>,
  document.getElementById('root')
)
