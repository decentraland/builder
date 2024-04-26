import React from 'react'
import { Checkbox, Table } from 'decentraland-ui'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import LoadingText from 'decentraland-ui/dist/components/Loader/LoadingText'
import { WorldPermissionNames } from 'lib/api/worlds'
import Icon from 'components/Icon'
import { WorldPermissionsCollaboratorsItemProps } from './WorldPermissionsCollaboratorsItem.types'
import { WorldPermissionsAvatarWithInfo } from '../Layouts/WorldPermissionsAvatarWithInfo'

export default React.memo(function WorldPermissionsCollaboratorsItem(props: WorldPermissionsCollaboratorsItemProps) {
  const {
    wallet,
    worldDeploymentPermissions,
    worldStreamingPermissions,
    profiles,
    onUserPermissionListChange,
    onRemoveCollaborator,
    loading
  } = props

  if (loading || !profiles || !wallet || !onUserPermissionListChange) {
    return (
      <Table.Row>
        <Table.Cell>
          <WorldPermissionsAvatarWithInfo loading />
        </Table.Cell>
        <Table.Cell>
          <LoadingText type="span" size="small"></LoadingText>
        </Table.Cell>
        <Table.Cell>
          <LoadingText type="span" size="small"></LoadingText>
        </Table.Cell>
        <Table.Cell>
          <Button basic loading />
        </Table.Cell>
      </Table.Row>
    )
  }

  return (
    <Table.Row>
      <Table.Cell>
        <WorldPermissionsAvatarWithInfo profiles={profiles} wallet={wallet} />
      </Table.Cell>
      <Table.Cell>
        <Checkbox
          onChange={e =>
            onUserPermissionListChange(e as React.MouseEvent<HTMLInputElement, MouseEvent>, {
              wallet,
              worldPermissionName: WorldPermissionNames.Deployment
            })
          }
          checked={worldDeploymentPermissions?.wallets.includes(wallet)}
        />
      </Table.Cell>
      <Table.Cell>
        <Checkbox
          onChange={e =>
            onUserPermissionListChange(e as React.MouseEvent<HTMLInputElement, MouseEvent>, {
              wallet,
              worldPermissionName: WorldPermissionNames.Streaming
            })
          }
          checked={worldStreamingPermissions?.wallets.includes(wallet)}
        />
      </Table.Cell>
      <Table.Cell>
        <Button basic wallet={wallet} onClick={e => onRemoveCollaborator && onRemoveCollaborator(e, { wallet })}>
          <Icon name="close" />
        </Button>
      </Table.Cell>
    </Table.Row>
  )
})
