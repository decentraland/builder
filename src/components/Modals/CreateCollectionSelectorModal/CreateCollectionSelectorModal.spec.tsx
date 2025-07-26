import { renderWithProviders } from 'specs/utils'
import { CreateCollectionSelectorModal } from './CreateCollectionSelectorModal'
import { Props } from './CreateCollectionSelectorModal.types'
import { CREATE_BUTTON_TEST_ID } from './constants'
import userEvent from '@testing-library/user-event'

export function renderWorldContributorTab(props: Partial<Props>) {
  return renderWithProviders(
    <CreateCollectionSelectorModal
      onCreateCollection={jest.fn()}
      onCreateThirdPartyCollection={jest.fn()}
      metadata={{}}
      name="aName"
      onClose={jest.fn()}
      {...props}
    />
  )
}

describe('when clicking on the create collection button', () => {
  let renderedComponent: ReturnType<typeof renderWorldContributorTab>
  let onCreateCollection: jest.Mock
  let onCreateThirdPartyCollection: jest.Mock

  beforeEach(() => {
    onCreateCollection = jest.fn()
    onCreateThirdPartyCollection = jest.fn()
    renderedComponent = renderWorldContributorTab({
      onCreateCollection,
      onCreateThirdPartyCollection
    })
  })

  describe('and the button belongs to the classic collections', () => {
    let createButton: HTMLElement
    beforeEach(() => {
      createButton = renderedComponent.getAllByTestId(CREATE_BUTTON_TEST_ID)[0]
      userEvent.click(createButton)
    })

    it('should call the onCreateCollection prop method', () => {
      expect(onCreateCollection).toHaveBeenCalled()
    })
  })

  describe('and the button belongs to the linked collections', () => {
    beforeEach(() => {
      const createButton = renderedComponent.getAllByTestId(CREATE_BUTTON_TEST_ID)[1]
      userEvent.click(createButton)
    })

    it('should call the onCreateThirdPartyCollection method prop', () => {
      expect(onCreateThirdPartyCollection).toHaveBeenCalled()
    })
  })
})
