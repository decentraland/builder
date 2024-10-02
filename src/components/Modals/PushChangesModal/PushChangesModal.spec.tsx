import userEvent from '@testing-library/user-event'
import { Collection } from 'modules/collection/types'
import { renderWithProviders } from 'specs/utils'
import { Props } from './PushChangesModal.types'
import { PushChangesModal } from './PushChangesModal'
import {
  PUSH_CHANGES_MODAL_CANCEL_CHANGES_DATA_TEST_ID,
  PUSH_CHANGES_MODAL_CONFIRM_CHANGES_DATA_TEST_ID,
  PUSH_CHANGES_MODAL_FIRST_STEP_DATA_TEST_ID
} from './constants'
import { REVIEW_CONTENT_POLICY_CONTINUE_DATA_TEST_ID } from '../PublishWizardCollectionModal/ReviewContentPolicyStep/constants'

const renderPushChangesModal = (props: Partial<Props> = {}) =>
  renderWithProviders(
    <PushChangesModal
      error={null}
      name="aName"
      onClose={jest.fn()}
      onPushChanges={jest.fn()}
      metadata={{ collectionId: 'aCollectionId', itemsWithChanges: [] }}
      isLoading={false}
      collection={{ id: 'aCollectionId', name: 'aName' } as Collection}
      {...props}
    />
  )

let props: Partial<Props>
let renderedComponent: ReturnType<typeof renderPushChangesModal>

beforeEach(() => {
  props = {}
})

describe('when rendering the component', () => {
  beforeEach(() => {
    renderedComponent = renderPushChangesModal(props)
  })

  it('should start the modal in the first step', () => {
    expect(renderedComponent.getByTestId(PUSH_CHANGES_MODAL_FIRST_STEP_DATA_TEST_ID)).toBeInTheDocument()
  })
})

describe('when rendering the component with an error', () => {
  beforeEach(() => {
    props.error = 'anError'
    renderedComponent = renderPushChangesModal(props)
  })

  it('should render the error message', () => {
    expect(renderedComponent.getByText('anError')).toBeInTheDocument()
  })
})

describe('when clicking cancel on the first step', () => {
  beforeEach(() => {
    props.onClose = jest.fn()
    renderedComponent = renderPushChangesModal(props)
    userEvent.click(renderedComponent.getByTestId(PUSH_CHANGES_MODAL_CANCEL_CHANGES_DATA_TEST_ID))
  })

  it('should call onClose', () => {
    expect(props.onClose).toHaveBeenCalled()
  })
})

describe('when clicking confirm on the first step', () => {
  beforeEach(() => {
    props.onPushChanges = jest.fn()
    renderedComponent = renderPushChangesModal(props)
    userEvent.click(renderedComponent.getByTestId(PUSH_CHANGES_MODAL_CONFIRM_CHANGES_DATA_TEST_ID))
  })

  it('should switch to the ToS step', () => {
    expect(renderedComponent.getByTestId(REVIEW_CONTENT_POLICY_CONTINUE_DATA_TEST_ID)).toBeInTheDocument()
  })
})
