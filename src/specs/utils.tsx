import { Provider } from 'react-redux'
import flatten from 'flat'
import { render } from '@testing-library/react'
import { Store } from 'redux'
import { createMemoryHistory } from 'history'
import { en } from 'decentraland-dapps/dist/modules/translation/defaults'
import { mergeTranslations } from 'decentraland-dapps/dist/modules/translation/utils'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import * as locales from 'modules/translation/languages'
import { RootState } from 'modules/common/types'
import { initTestStore } from 'modules/common/store'
import { ConnectedRouter } from 'connected-react-router'

const allTranslations = mergeTranslations(
  flatten(en) as unknown as Record<string, string>,
  flatten(locales.en) as unknown as Record<string, string>
)

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
          en: allTranslations
        },
        locale: 'en'
      }
    })

  const history = createMemoryHistory()

  function AppProviders({ children }: { children: JSX.Element }) {
    return (
      <Provider store={initializedStore}>
        <TranslationProvider locales={['en']}>
          <ConnectedRouter history={history}>{children}</ConnectedRouter>
        </TranslationProvider>
      </Provider>
    )
  }

  return render(component, { wrapper: AppProviders })
}
