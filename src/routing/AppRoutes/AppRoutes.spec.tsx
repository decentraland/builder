import { createMemoryHistory, MemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { render } from '@testing-library/react'
import { locations } from 'routing/locations'
import { AppRoutes } from './AppRoutes'

jest.mock('decentraland-dapps/dist/hooks/usePageTracking', () => ({
  usePageTracking: jest.fn()
}))
jest.mock('components/LoadingPage', () => ({ __esModule: true, default: () => null }))
jest.mock('components/MobilePage', () => ({ __esModule: true, default: () => null }))
jest.mock('modules/ProtectedRoute', () => ({ ProtectedRoute: () => null }))

const renderAt = (path: string): MemoryHistory => {
  const history = createMemoryHistory({ initialEntries: [path] })
  render(
    <Router history={history}>
      <AppRoutes onLocationChange={jest.fn()} />
    </Router>
  )
  return history
}

describe('when visiting a sunset scene creation route on desktop', () => {
  beforeEach(() => {
    window.innerWidth = 1280
  })

  it.each([
    locations.sceneEditor('aProjectId'),
    locations.inspector('aProjectId'),
    locations.templates(),
    locations.templateDetail('aTemplateId')
  ])('should redirect %s to the scenes list', path => {
    expect(renderAt(path).location.pathname).toBe(locations.scenes())
  })
})
