import { screen } from '@testing-library/react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { renderWithProviders } from 'specs/utils'
import ImportStep from './ImportStep'
import { Props } from './ImportStep.types'

jest.mock('lib/getModelData', () => ({
  EngineType: {},
  getEmoteData: jest.fn(),
  loadAndValidateModel: jest.fn()
}))

function renderImportStep(props: Partial<Props> = {}) {
  const defaultProps: Props = {
    collection: null,
    title: 'New Item',
    isLoading: false,
    onDropAccepted: jest.fn(),
    onClose: jest.fn()
  }
  return renderWithProviders(<ImportStep {...defaultProps} {...props} />)
}

describe('when the preview fails after the file was accepted', () => {
  let rerender: ReturnType<typeof renderImportStep>['rerender']

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    ;({ rerender } = renderImportStep({ isLoading: true }))
    rerender(
      <ImportStep
        collection={null}
        title="New Item"
        isLoading={false}
        loadError="Request timeout for getScreenshot"
        onDropAccepted={jest.fn()}
        onClose={jest.fn()}
      />
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should show the unexpected error with its details', () => {
    expect(screen.getByText(t('create_single_item_modal.error.unexpected_error.title'))).toBeInTheDocument()
    expect(screen.getByText('Request timeout for getScreenshot', { exact: false })).toBeInTheDocument()
  })
})

describe('when there is no load error', () => {
  beforeEach(() => {
    renderImportStep()
  })

  it('should not show the unexpected error', () => {
    expect(screen.queryByText(t('create_single_item_modal.error.unexpected_error.title'))).not.toBeInTheDocument()
  })
})
