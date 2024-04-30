import { fireEvent } from '@testing-library/react'
import { Table } from 'decentraland-ui'
import { WorldPermissionNames } from 'lib/api/worlds'
import { renderWithProviders } from 'specs/utils'
import {
  WORLD_PERMISSIONS_COLLABORATORS_ITEM_BUTTON_TEST_ID,
  WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID,
  WORLD_PERMISSIONS_COLLABORATORS_ITEM_LOADING_ROW_TEST_ID,
  WORLD_PERMISSIONS_COLLABORATORS_ITEM_STREAMING_CHECKBOX_TEST_ID,
  WorldPermissionsCollaboratorsItem
} from './WorldPermissionsCollaboratorsItem'

const renderWorldPermissionsCollaboratorsItem = (props: any) =>
  renderWithProviders(
    <Table>
      <Table.Body>
        <WorldPermissionsCollaboratorsItem {...props} />
      </Table.Body>
    </Table>
  )

describe('when the component is loading', () => {
  it('should render the loading row', () => {
    const { getByTestId } = renderWorldPermissionsCollaboratorsItem({ loading: true, walletAddress: '0x123' })
    expect(getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_LOADING_ROW_TEST_ID)).toBeInTheDocument()
  })
})

describe('when the wallet address prop is not set', () => {
  it('should render the loading row', () => {
    const { getByTestId } = renderWorldPermissionsCollaboratorsItem({ walletAddress: undefined, loading: false })
    expect(getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_LOADING_ROW_TEST_ID)).toBeInTheDocument()
  })
})

describe('when the onUserPermissionListChange prop is not set', () => {
  it('should render the loading row', () => {
    const { getByTestId } = renderWorldPermissionsCollaboratorsItem({ onUserPermissionListChange: undefined, loading: false })
    expect(getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_LOADING_ROW_TEST_ID)).toBeInTheDocument()
  })
})

describe('when the component is not loading, the wallet address prop and the onUserPermissionListChange prop is set', () => {
  let walletAddress: string
  let loading: false
  let onUserPermissionListChange: jest.Mock

  beforeEach(() => {
    walletAddress = '0x123'
    loading = false
    onUserPermissionListChange = jest.fn()
  })

  describe('and the wallet address has world deployment permissions', () => {
    it('should render the deployment checkbox as checked', () => {
      const { getByTestId } = renderWorldPermissionsCollaboratorsItem({
        walletAddress,
        onUserPermissionListChange,
        hasWorldDeploymentPermission: true,
        loading
      })
      const checkbox = getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID).children[0]
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('checked')
    })
  })

  describe('and the wallet address does not have world deployment permissions', () => {
    it('should render the deployment checkbox as unchecked', () => {
      const { getByTestId } = renderWorldPermissionsCollaboratorsItem({
        walletAddress,
        onUserPermissionListChange,
        hasWorldDeploymentPermission: false,
        loading
      })
      const checkbox = getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID).children[0]
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toHaveAttribute('checked')
    })
  })

  describe('and the deployment checkbox is clicked', () => {
    it('should call the onUserPermissionListChange prop with the wallet address and the deployment permission name', () => {
      const { getByTestId } = renderWorldPermissionsCollaboratorsItem({
        walletAddress,
        onUserPermissionListChange,
        hasWorldDeploymentPermission: false,
        loading
      })
      const checkbox = getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID).children[0]
      fireEvent.click(checkbox)
      expect(onUserPermissionListChange).toHaveBeenCalledWith(expect.anything(), {
        walletAddress,
        worldPermissionName: WorldPermissionNames.Deployment
      })
    })
  })

  describe('and the wallet address has world streaming permissions', () => {
    it('should render the streaming checkbox as checked', () => {
      const { getByTestId } = renderWorldPermissionsCollaboratorsItem({
        walletAddress,
        onUserPermissionListChange,
        hasWorldStreamingPermission: true,
        loading
      })
      const checkbox = getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_STREAMING_CHECKBOX_TEST_ID).children[0]
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('checked')
    })
  })

  describe('and the wallet address does not have world streaming permissions', () => {
    it('should render the streaming checkbox as unchecked', () => {
      const { getByTestId } = renderWorldPermissionsCollaboratorsItem({
        walletAddress,
        onUserPermissionListChange,
        hasWorldStreamingPermission: false,
        loading
      })
      const checkbox = getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_STREAMING_CHECKBOX_TEST_ID).children[0]
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toHaveAttribute('checked')
    })
  })

  describe('and the streaming checkbox is clicked', () => {
    it('should call the onUserPermissionListChange prop with the wallet address and the streaming permission name', () => {
      const { getByTestId } = renderWorldPermissionsCollaboratorsItem({
        walletAddress,
        onUserPermissionListChange,
        hasWorldStreamingPermission: false,
        loading
      })
      const checkbox = getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_STREAMING_CHECKBOX_TEST_ID).children[0]
      fireEvent.click(checkbox)
      expect(onUserPermissionListChange).toHaveBeenCalledWith(expect.anything(), {
        walletAddress,
        worldPermissionName: WorldPermissionNames.Streaming
      })
    })
  })

  describe('and the remove wallet button is clicked', () => {
    let onRemoveCollaborator: jest.Mock
    beforeEach(() => {
      onRemoveCollaborator = jest.fn()
    })

    it('should call the onRemoveCollaborator prop with the wallet address', () => {
      const { getByTestId } = renderWorldPermissionsCollaboratorsItem({
        walletAddress,
        onUserPermissionListChange,
        onRemoveCollaborator,
        loading
      })
      const button = getByTestId(WORLD_PERMISSIONS_COLLABORATORS_ITEM_BUTTON_TEST_ID)
      fireEvent.click(button)
      expect(onRemoveCollaborator).toHaveBeenCalledWith(expect.anything(), { walletAddress })
    })
  })
})
