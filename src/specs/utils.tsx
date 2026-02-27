import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import * as flatten from 'flat'
import { render } from '@testing-library/react'
import { Store } from 'redux'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { en } from 'decentraland-dapps/dist/modules/translation/defaults'
import { mergeTranslations } from 'decentraland-dapps/dist/modules/translation/utils'
// Import the base component, not the container, to avoid Redux dependency for translations
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider/TranslationProvider'
import * as locales from 'modules/translation/languages'
import { RootState, RootStore } from 'modules/common/types'
import { createRootReducer } from 'modules/common/reducer'

function initTestStore(preloadedState = {}): RootStore {
  const rootReducer = createRootReducer()
  return createStore(rootReducer, preloadedState) as RootStore
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const allTranslations = mergeTranslations(flatten.flatten(en) as unknown as Record<string, string>, flatten.flatten(locales.en))
export function renderWithProviders(
  component: JSX.Element,
  { preloadedState, store }: { preloadedState?: Partial<RootState>; store?: Store } = {}
) {
  const initializedStore =
    store ||
    initTestStore({
      ...(preloadedState || {}),
      storage: { loading: false, version: 1 },
      translation: {
        data: {
          en: allTranslations
        },
        locale: 'en',
        loading: []
      }
    })

  const history = createMemoryHistory()

  function AppProviders({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={initializedStore}>
        <TranslationProvider
          locales={['en']}
          locale="en"
          translations={allTranslations}
          onFetchTranslations={() => ({ type: '[Request] Fetch Translations', payload: { locale: 'en' as const } })}
        >
          <Router history={history}>{children}</Router>
        </TranslationProvider>
      </Provider>
    )
  }

  return render(component, { wrapper: AppProviders })
}
