import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { createBrowserHistory } from 'history'
import { createStore } from 'redux'
import flatten from 'flat'
import { render } from '@testing-library/react'
import { Store } from 'redux'
import { createMemoryHistory } from 'history'
import { en } from 'decentraland-dapps/dist/modules/translation/defaults'
import { mergeTranslations } from 'decentraland-dapps/dist/modules/translation/utils'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import * as locales from 'modules/translation/languages'
import { RootState, RootStore } from 'modules/common/types'
import { ConnectedRouter } from 'connected-react-router'
import { createRootReducer } from 'modules/common/reducer'

function initTestStore(preloadedState = {}): RootStore {
  const basename = /^decentraland.(zone|org|today)$/.test(window.location.host) ? '/builder' : undefined
  const history = createBrowserHistory({ basename })
  const rootReducer = createRootReducer(history)
  return createStore(rootReducer, preloadedState) as RootStore
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const allTranslations = mergeTranslations(flatten(en) as unknown as Record<string, string>, flatten(locales.en))
export function renderWithProviders(
  component: JSX.Element,
  { preloadedState, store }: { preloadedState?: Partial<RootState>; store?: Store } = {}
) {
  const initializedStore =
    store ||
    initTestStore({
      ...(preloadedState || {}),
      storage: { loading: false },
      translation: {
        data: {
          en: allTranslations,
          'en-EN': allTranslations
        },
        locale: 'en-EN'
      }
    })

  const history = createMemoryHistory()

  function AppProviders({ children }: { children: ReactNode }) {
    return (
      <Provider store={initializedStore}>
        <TranslationProvider locales={['en', 'en-EN']}>
          <ConnectedRouter history={history}>{children}</ConnectedRouter>
        </TranslationProvider>
      </Provider>
    )
  }

  return render(component, { wrapper: AppProviders })
}
