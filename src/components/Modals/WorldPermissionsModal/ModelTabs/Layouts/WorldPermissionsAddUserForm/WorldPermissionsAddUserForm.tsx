import React from 'react'
import { Icon } from 'decentraland-ui'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { WorldPermissionNames } from 'lib/api/worlds'

import styles from './WorldPermissionsAddUserForm.module.css'
import { Props } from './WorldPermissionsAddUserForm.types'

export const WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID = 'world-permissions-add-user-form-show-form-button-data-test-id'
export const WORLD_PERMISSIONS_ADD_USER_FORM_FIELD_DATA_TEST_ID = 'world-permissions-add-user-form-field-data-test-id'
export const WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID =
  'world-permissions-add-user-form-change-permission-button-data-test-id'

export const WorldPermissionsAddUserForm = React.memo((props: Props) => {
  const {
    showAddUserForm,
    newAddress,
    isLoading,
    isLoadingNewUser,
    addButtonLabel,
    error,
    onShowAddUserForm,
    onNewAddressChange,
    onUserPermissionListChange
  } = props

  return (
    <div className={styles.addUserWrapper}>
      {!showAddUserForm ? (
        <div className={styles.addUserButtonContainer}>
          <Button
            data-testid={WORLD_PERMISSIONS_ADD_USER_FORM_SHOW_FORM_BUTTON_DATA_TEST_ID}
            onClick={onShowAddUserForm}
            loading={isLoading}
          >
            <Icon name="plus" />
            {addButtonLabel}
          </Button>
        </div>
      ) : (
        <div className={styles.addUserFormContainer}>
          <Field
            data-testid={WORLD_PERMISSIONS_ADD_USER_FORM_FIELD_DATA_TEST_ID}
            placeholder="0x..."
            value={newAddress}
            onChange={onNewAddressChange}
            kind="full"
            loading={isLoadingNewUser}
            disabled={isLoadingNewUser}
            error={error}
            message={error ? t('world_permissions_modal.invalid_address') : ''}
          />
          <Button
            data-testid={WORLD_PERMISSIONS_ADD_USER_FORM_CHANGE_PERMISSION_BUTTON_DATA_TEST_ID}
            onClick={e =>
              newAddress === ''
                ? onShowAddUserForm(e, {})
                : onUserPermissionListChange(e, { walletAddress: newAddress, worldPermissionName: WorldPermissionNames.Access })
            }
            loading={isLoadingNewUser}
            disabled={isLoadingNewUser || error}
          >
            {newAddress === '' ? t('world_permissions_modal.button_cancel_label') : t('world_permissions_modal.button_add_label')}
          </Button>
        </div>
      )}
    </div>
  )
})
