import { renderWithProviders } from 'specs/utils'
import { CreateCollectionSelectorModal } from './CreateCollectionSelectorModal'
import { Props } from './CreateCollectionSelectorModal.types'
import { CREATE_BUTTON_TEST_ID, DISABLED_DATA_TEST_ID } from './constants'
import userEvent from '@testing-library/user-event'

export function renderWorldContributorTab(props: Partial<Props>) {
  return renderWithProviders(
    <CreateCollectionSelectorModal
      onCreateCollection={jest.fn()}
      onCreateLinkedWearablesCollection={jest.fn()}
      metadata={{}}
      name="aName"
      onClose={jest.fn()}
      isLoadingThirdParties={false}
      isThirdPartyManager={false}
      {...props}
    />
  )
}

describe('when clicking on the create collection button', () => {
  let renderedComponent: ReturnType<typeof renderWorldContributorTab>
  let onCreateCollection: jest.Mock
  let onCreateLinkedWearablesCollection: jest.Mock

  beforeEach(() => {
    onCreateCollection = jest.fn()
    onCreateLinkedWearablesCollection = jest.fn()
    renderedComponent = renderWorldContributorTab({
      onCreateCollection,
      onCreateLinkedWearablesCollection,
      isThirdPartyManager: true
    })
  })

  describe('and the button belongs to the classic collections', () => {
    let createButton: HTMLElement
    beforeEach(() => {
      createButton = renderedComponent.getAllByTestId(CREATE_BUTTON_TEST_ID)[0]
      userEvent.click(createButton)
    })

    it('should call the the onCreateCollection prop method', () => {
      expect(onCreateCollection).toHaveBeenCalled()
    })
  })

  describe('and the button belongs to the linked collections', () => {
    beforeEach(() => {
      const createButton = renderedComponent.getAllByTestId(CREATE_BUTTON_TEST_ID)[1]
      userEvent.click(createButton)
    })

    it('should call the onCreateLinkedWearablesCollection method prop', () => {
      expect(onCreateLinkedWearablesCollection).toHaveBeenCalled()
    })
  })
})

describe('and the linked collections are being loaded', () => {
  let renderedComponent: ReturnType<typeof renderWorldContributorTab>
  beforeEach(() => {
    renderedComponent = renderWorldContributorTab({ isLoadingThirdParties: true })
  })

  it('should show the disabled overlay for the linked collections', () => {
    const disabledOverlay = renderedComponent.getByTestId(DISABLED_DATA_TEST_ID)
    expect(disabledOverlay).toBeInTheDocument()
  })

  it('should disable the create button for the linked collections', () => {
    const createButton = renderedComponent.getAllByTestId(CREATE_BUTTON_TEST_ID)[1]
    expect(createButton).toBeDisabled()
  })

  it('should set the button as loading', () => {
    const createButton = renderedComponent.getAllByTestId(CREATE_BUTTON_TEST_ID)[1]
    expect(createButton).toHaveClass('loading')
  })
})

describe('and the user is not a third party manager', () => {
  let renderedComponent: ReturnType<typeof renderWorldContributorTab>
  beforeEach(() => {
    renderedComponent = renderWorldContributorTab({ isThirdPartyManager: false })
  })

  it('should show the disabled overlay for the linked collections', () => {
    const disabledOverlay = renderedComponent.getByTestId(DISABLED_DATA_TEST_ID)
    expect(disabledOverlay).toBeInTheDocument()
  })

  it('should disable the create button for the linked collections', () => {
    const createButton = renderedComponent.getAllByTestId(CREATE_BUTTON_TEST_ID)[1]
    expect(createButton).toBeDisabled()
  })
})
