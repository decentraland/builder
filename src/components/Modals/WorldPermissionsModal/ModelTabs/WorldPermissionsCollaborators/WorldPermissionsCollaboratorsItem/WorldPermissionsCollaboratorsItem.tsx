import React from 'react'
import { Checkbox, Table } from 'decentraland-ui'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import { WorldPermissionNames } from 'lib/api/worlds'
import Icon from 'components/Icon'
import { Props } from './WorldPermissionsCollaboratorsItem.types'
import { WorldPermissionsAvatarWithInfo } from '../../Layouts/WorldPermissionsAvatarWithInfo'

export const WORLD_PERMISSIONS_COLLABORATORS_ITEM_LOADING_ROW_TEST_ID = 'world-permissions-collaborators-item-test-id'
export const WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID =
  'world-permissions-collaborators-item-deployment-checkbox-test-id'
export const WORLD_PERMISSIONS_COLLABORATORS_ITEM_STREAMING_CHECKBOX_TEST_ID =
  'world-permissions-collaborators-item-streaming-checkbox-test-id'
export const WORLD_PERMISSIONS_COLLABORATORS_ITEM_BUTTON_TEST_ID = 'world-permissions-collaborators-item-button-test-id'

export const WorldPermissionsCollaboratorsItem = React.memo((props: Props) => {
  const {
    walletAddress,
    hasWorldDeploymentPermission,
    hasWorldStreamingPermission,
    onUserPermissionListChange,
    onRemoveCollaborator,
    loading
  } = props

  if (loading || !walletAddress || !onUserPermissionListChange) {
    return (
      <Table.Row data-testid={WORLD_PERMISSIONS_COLLABORATORS_ITEM_LOADING_ROW_TEST_ID}>
        <Table.Cell>
          <WorldPermissionsAvatarWithInfo isLoading walletAddress="" />
        </Table.Cell>
        <Table.Cell>
          <LoadingText type="span" size="small"></LoadingText>
        </Table.Cell>
        <Table.Cell>
          <LoadingText type="span" size="small"></LoadingText>
        </Table.Cell>
        <Table.Cell>
          <Button basic loading disabled />
        </Table.Cell>
      </Table.Row>
    )
  }

  return (
    <Table.Row>
      <Table.Cell>
        <WorldPermissionsAvatarWithInfo walletAddress={walletAddress} />
      </Table.Cell>
      <Table.Cell>
        <Checkbox
          data-testid={WORLD_PERMISSIONS_COLLABORATORS_ITEM_DEPLOYMENT_CHECKBOX_TEST_ID}
          onChange={e =>
            onUserPermissionListChange(e as React.MouseEvent<HTMLInputElement, MouseEvent>, {
              walletAddress,
              worldPermissionName: WorldPermissionNames.Deployment
            })
          }
          checked={hasWorldDeploymentPermission}
        />
      </Table.Cell>
      <Table.Cell>
        <Checkbox
          data-testid={WORLD_PERMISSIONS_COLLABORATORS_ITEM_STREAMING_CHECKBOX_TEST_ID}
          onChange={e =>
            onUserPermissionListChange(e as React.MouseEvent<HTMLInputElement, MouseEvent>, {
              walletAddress,
              worldPermissionName: WorldPermissionNames.Streaming
            })
          }
          checked={hasWorldStreamingPermission}
        />
      </Table.Cell>
      <Table.Cell>
        <Button
          data-testid={WORLD_PERMISSIONS_COLLABORATORS_ITEM_BUTTON_TEST_ID}
          basic
          onClick={e => onRemoveCollaborator && onRemoveCollaborator(e, { walletAddress })}
        >
          <Icon name="close" />
        </Button>
      </Table.Cell>
    </Table.Row>
  )
})
