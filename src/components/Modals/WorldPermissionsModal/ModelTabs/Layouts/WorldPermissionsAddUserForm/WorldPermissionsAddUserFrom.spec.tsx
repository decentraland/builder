import { render, fireEvent } from '@testing-library/react'
import { WorldPermissionNames } from 'lib/api/worlds'
import {
  WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID,
  WORLD_PERMISSIONS_ADD_USER_FORM_FIELD_DATA_TEST_ID,
  WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID,
  WorldPermissionsAddUserForm
} from './WorldPermissionsAddUserForm'
import { Props } from './WorldPermissionsAddUserForm.types'

const renderWorldPermissionsAddUserForm = (props: Partial<Props> = {}) =>
  render(
    <WorldPermissionsAddUserForm
      showAddUserForm={false}
      newAddress={'aNewAddress'}
      isLoading={false}
      isLoadingNewUser={false}
      addButtonLabel={'aButtonLabel'}
      error={false}
      onShowAddUserForm={() => undefined}
      onNewAddressChange={() => undefined}
      onUserPermissionListChange={() => undefined}
      {...props}
    />
  )

describe("when rendering the Worlds Permissions Add User Form it's loading", () => {
  it('should not render the description', () => {
    const { queryByTestId } = renderWorldPermissionsAddUserForm({ isLoading: true })
    expect(queryByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID)).toBeInTheDocument()
    console.log(queryByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID))
    expect(queryByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID)).toHaveClass('loading')
  })
})

describe('when rendering the Worlds Permissions Add User Form', () => {
  let renderedComponent: ReturnType<typeof renderWorldPermissionsAddUserForm>
  const buttonLabel = 'aButtonLabel'

  describe('and the prop to show the add user form is set to false', () => {
    let onShowAddUserForm: jest.Mock

    beforeEach(() => {
      onShowAddUserForm = jest.fn()
      renderedComponent = renderWorldPermissionsAddUserForm({ showAddUserForm: false, addButtonLabel: buttonLabel, onShowAddUserForm })
    })

    it('should render a button to show the form', () => {
      const { getByTestId } = renderedComponent
      const showFormButton = getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID)

      expect(showFormButton).toBeInTheDocument()
      expect(showFormButton.textContent).toEqual(buttonLabel)
    })

    describe('when clicking the button to show the form', () => {
      beforeEach(() => {
        const { getByTestId } = renderedComponent
        const showFormButton = getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID)
        fireEvent.click(showFormButton)
      })

      it('should call the onShowAddUserForm method prop', () => {
        expect(onShowAddUserForm).toHaveBeenCalled()
      })
    })
  })

  describe('and the prop to show the add user form is set to true', () => {
    let showAddUserForm: boolean

    beforeEach(() => {
      showAddUserForm = true
    })

    describe('and the address field is changed', () => {
      let onNewAddressChange: jest.Mock

      beforeEach(() => {
        onNewAddressChange = jest.fn()
        renderedComponent = renderWorldPermissionsAddUserForm({ showAddUserForm, onNewAddressChange })
        const { getByTestId } = renderedComponent
        const showFormButton = getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_FIELD_DATA_TEST_ID).children[0]
        fireEvent.change(showFormButton, { target: { value: '0x00' } })
      })

      it('should call the onNewAddressChange method prop', () => {
        expect(onNewAddressChange).toHaveBeenCalled()
      })
    })

    describe("and there's an error", () => {
      let error: boolean

      beforeEach(() => {
        error = true
        renderedComponent = renderWorldPermissionsAddUserForm({ showAddUserForm, error })
      })

      it('should render the the button as disabled', () => {
        const { getByTestId } = renderedComponent
        const changePermissionButton = getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID)

        expect(changePermissionButton).toHaveAttribute('disabled')
      })
    })

    describe('and a new user is being loaded', () => {
      let isLoadingNewUser: boolean

      beforeEach(() => {
        isLoadingNewUser = true
        renderedComponent = renderWorldPermissionsAddUserForm({ showAddUserForm, isLoadingNewUser })
      })

      it('should render disabled the field and the button and set them as loading', () => {
        const { getByTestId, debug } = renderedComponent
        const changePermissionButton = getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID)
        const addressField = getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_FIELD_DATA_TEST_ID)
        debug()

        expect(addressField).toHaveClass('disabled')
        expect(addressField).toHaveClass('loading')
        expect(changePermissionButton).toHaveAttribute('disabled')
        expect(changePermissionButton).toHaveClass('loading')
      })
    })

    describe('and clicking the button to change the permission', () => {
      let newAddress: string

      describe('when the newAddress prop is empty', () => {
        let onShowAddUserForm: jest.Mock

        beforeEach(() => {
          newAddress = ''
          onShowAddUserForm = jest.fn()
          renderedComponent = renderWorldPermissionsAddUserForm({ showAddUserForm, newAddress, onShowAddUserForm })
          const { getByTestId } = renderedComponent
          const changePermissionButton = getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID)
          fireEvent.click(changePermissionButton)
        })

        it('should call the onShowAddUserForm method prop', () => {
          expect(onShowAddUserForm).toHaveBeenCalled()
        })
      })

      describe('when the new address prop is set', () => {
        let onUserPermissionListChange: jest.Mock

        beforeEach(() => {
          newAddress = 'aNewAddress'
          onUserPermissionListChange = jest.fn()
          renderedComponent = renderWorldPermissionsAddUserForm({ showAddUserForm, newAddress, onUserPermissionListChange })
          const { getByTestId } = renderedComponent
          const changePermissionButton = getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID)
          fireEvent.click(changePermissionButton)
        })

        it('should call the onUserPermissionListChange method prop', () => {
          expect(onUserPermissionListChange).toHaveBeenCalledWith(expect.anything(), {
            walletAddress: newAddress,
            worldPermissionName: WorldPermissionNames.Access
          })
        })
      })
    })
  })
})
