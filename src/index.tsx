import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { DragDropContextProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import ModalProvider from 'decentraland-dapps/dist/providers/ModalProvider'

import { store, history } from 'modules/common/store'
import * as modals from 'components/Modals'
import * as languages from 'modules/translation/languages'
import Routes from 'routing/Routes'

import './modules/analytics/track'
import './modules/analytics/rollbar'
import './themes'
import './index.css'

ReactDOM.render(
  <Provider store={store}>
    <DragDropContextProvider backend={HTML5Backend}>
      <TranslationProvider locales={Object.keys(languages)}>
        <ModalProvider components={modals}>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </ModalProvider>
      </TranslationProvider>
    </DragDropContextProvider>
  </Provider>,
  document.getElementById('root')
)
