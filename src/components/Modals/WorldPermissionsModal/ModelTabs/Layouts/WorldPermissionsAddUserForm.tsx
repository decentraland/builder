import React from 'react'
import { Icon } from 'decentraland-ui'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { WorldPermissionNames } from 'lib/api/worlds'

import styles from './WorldPermissionsAddUserForm.module.css'

type WorldPermissionsAddUserFormProps = {
  showAddUserForm: boolean
  newAddress: string
  isLoadingNewUser: boolean
  addButtonLabel: string
  error: boolean
  onShowAddUserForm: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) => void
  onNewAddressChange: (e: React.ChangeEvent<HTMLInputElement>, data: any) => void
  onUserPermissionListChange: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) => void
}

export default React.memo(function WorldPermissionsAddUserForm(props: WorldPermissionsAddUserFormProps) {
  const {
    showAddUserForm,
    newAddress,
    isLoadingNewUser,
    addButtonLabel,
    error,
    onShowAddUserForm,
    onNewAddressChange,
    onUserPermissionListChange
  } = props

  return (
    <div className={styles.addWserWrapper}>
      {!showAddUserForm && (
        <div className={styles.addUserButtonContainer}>
          <Button onClick={onShowAddUserForm}>
            <Icon name="plus" />
            {addButtonLabel}
          </Button>
        </div>
      )}
      {showAddUserForm && (
        <div className={styles.addWserFormContainer}>
          <Field
            placeholder="0x..."
            value={newAddress}
            onChange={onNewAddressChange}
            kind="full"
            error={error}
            message={error ? 'invalid address' : ''}
          />
          <Button
            onClick={e =>
              newAddress === ''
                ? onShowAddUserForm(e, {})
                : onUserPermissionListChange(e, { wallet: newAddress, worldPermissionName: WorldPermissionNames.Access })
            }
            loading={isLoadingNewUser}
            disabled={isLoadingNewUser}
          >
            {newAddress === '' ? t('world_permissions_modal.button_cancel_label') : t('world_permissions_modal.button_add_label')}
          </Button>
        </div>
      )}
    </div>
  )
})
