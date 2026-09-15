import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from 'specs/utils'
import { WorldPermissionNames, WorldPermissionType, WorldPermissions } from 'lib/api/worlds'
import {
  WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID,
  WORLD_PERMISSIONS_ADD_USER_FORM_FIELD_DATA_TEST_ID,
  WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID
} from './ModelTabs/Layouts/WorldPermissionsAddUserForm/WorldPermissionsAddUserForm'
import { WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID } from './ModelTabs/WorldPermissionsCollaborators/WorldPermissionsCollaboratorsItem/WorldPermissionsCollaboratorsItem'
import WorldPermissionsModal from './WorldPermissionsModal'
import { Props } from './WorldPermissionsModal.types'

const worldName = 'my-world'
const existingCollaborator = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const newCollaborator = '0xBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb'

const buildWorldPermissions = (deploymentWallets: string[] = []): WorldPermissions => ({
  access: { type: WorldPermissionType.Unrestricted },
  deployment: { type: WorldPermissionType.AllowList, wallets: deploymentWallets },
  streaming: { type: WorldPermissionType.AllowList, wallets: [] }
})

const renderWorldPermissionsModal = (props: Partial<Props> = {}) =>
  renderWithProviders(
    <WorldPermissionsModal
      name="WorldPermissionsModal"
      error={null}
      metadata={{ worldName, isCollaboratorsTabShown: true }}
      worldPermissions={buildWorldPermissions()}
      isLoading={false}
      onPutWorldPermissionsRequest={jest.fn()}
      onPostWorldPermissionsRequest={jest.fn()}
      onDeleteWorldPermissionsRequest={jest.fn()}
      onGetProfile={jest.fn()}
      onGetWorldPermissions={jest.fn()}
      onClose={jest.fn()}
      {...props}
    />
  )

const addCollaborator = (renderedComponent: ReturnType<typeof renderWorldPermissionsModal>, address: string) => {
  const { getByTestId } = renderedComponent
  fireEvent.click(getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID))
  fireEvent.change(getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_FIELD_DATA_TEST_ID).children[0], { target: { value: address } })
  fireEvent.click(getByTestId(WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID))
}

describe('when adding a collaborator', () => {
  let onPutWorldPermissionsRequest: jest.Mock
  let renderedComponent: ReturnType<typeof renderWorldPermissionsModal>

  beforeEach(() => {
    onPutWorldPermissionsRequest = jest.fn()
  })

  describe('and the wallet is not a collaborator yet', () => {
    beforeEach(() => {
      renderedComponent = renderWorldPermissionsModal({ onPutWorldPermissionsRequest })
      addCollaborator(renderedComponent, newCollaborator)
    })

    it('should grant the deployment permission to the lowercased wallet so the collaborator is persisted', () => {
      expect(onPutWorldPermissionsRequest).toHaveBeenCalledWith(
        worldName,
        WorldPermissionNames.Deployment,
        WorldPermissionType.AllowList,
        newCollaborator.toLowerCase()
      )
    })

    it('should render the collaborator in the list', () => {
      expect(renderedComponent.getAllByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID)).toHaveLength(1)
    })
  })

  describe('and the wallet is already a collaborator with a different casing', () => {
    beforeEach(() => {
      renderedComponent = renderWorldPermissionsModal({
        onPutWorldPermissionsRequest,
        worldPermissions: buildWorldPermissions([existingCollaborator])
      })
      addCollaborator(renderedComponent, existingCollaborator.toUpperCase().replace('0X', '0x'))
    })

    it('should not grant any permission', () => {
      expect(onPutWorldPermissionsRequest).not.toHaveBeenCalled()
    })

    it('should not duplicate the collaborator in the list', () => {
      expect(renderedComponent.getAllByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID)).toHaveLength(1)
    })
  })

  describe('and the wallet is not a valid address', () => {
    beforeEach(() => {
      renderedComponent = renderWorldPermissionsModal({ onPutWorldPermissionsRequest })
      addCollaborator(renderedComponent, '0x1234')
    })

    it('should not grant any permission', () => {
      expect(onPutWorldPermissionsRequest).not.toHaveBeenCalled()
    })
  })
})
