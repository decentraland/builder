import * as React from 'react'
import { ModalNavigation, ModalActions, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { isValid } from 'lib/address'
import { getSaleAddress, setOnSale, isOnSale } from 'modules/collection/utils'
import { Access, RoleType } from 'modules/collection/types'
import { isEqual } from 'lib/address'
import Role from './Role'
import EmptyRole from './EmptyRole'
import { Props, State } from './ManageCollectionRoleModal.types'
import './ManageCollectionRoleModal.css'

export default class ManageCollectionRoleModal extends React.PureComponent<Props, State> {
  state: State = { roles: this.getStartRoles() }

  getStartRoles() {
    const { metadata } = this.props
    const roles = new Set(metadata.roles)
    roles.delete(this.getSaleAddress())
    return Array.from(roles)
  }

  handleAddNewRole = () => {
    const { roles } = this.state
    this.setState({
      roles: [...roles, undefined]
    })
  }

  handleAddRole = (index: number, role: string) => {
    if (this.isValidRole(role)) {
      const roles = this.removeRoleAtIndex(index)
      roles.push(role.toLowerCase())

      this.setState({ roles })
    }
  }

  handleRemoveRole = (role: string) => {
    const { roles } = this.state
    this.setState({
      roles: roles.filter(_role => _role !== role)
    })
  }

  handleCancelNew = (index: number) => {
    this.setState({
      roles: this.removeRoleAtIndex(index)
    })
  }

  handleSubmit = () => {
    const { collection, metadata } = this.props
    const { roles } = this.state
    const originalRoles = metadata.roles

    const accessList: Access[] = []
    for (const role of originalRoles) {
      if (!roles.includes(role)) {
        accessList.push({ address: role, hasAccess: false, collection })
      }
    }
    for (const role of roles) {
      if (!originalRoles.includes(role!)) {
        accessList.push({ address: role!, hasAccess: true, collection })
      }
    }
    this.setRoles(accessList)
  }

  removeRoleAtIndex(index: number) {
    const { roles } = this.state
    return [...roles.slice(0, index), ...roles.slice(index + 1)]
  }

  isValidRole(role: string) {
    return isValid(role) && !this.state.roles.includes(role) && !isEqual(role, this.getSaleAddress())
  }

  getSaleAddress() {
    const { wallet } = this.props
    return getSaleAddress(wallet.networks.MATIC.chainId)
  }

  setRoles(accessList: Access[]) {
    const { wallet, metadata, collection, onSetManagers, onSetMinters } = this.props
    const { type } = metadata

    // Restore the store access to the collection, removed on the first `state`
    accessList.push(...setOnSale(collection, wallet, isOnSale(collection, wallet)))

    switch (type) {
      case RoleType.MANAGER:
        return onSetManagers(collection, accessList)
      case RoleType.MINTER:
        return onSetMinters(collection, accessList)
      default:
        throw new Error(`Invalid role type ${type}`)
    }
  }

  hasRoleChanged() {
    return this.getStartRoles().length !== this.state.roles.filter(role => !!role).length
  }

  render() {
    const { metadata, isLoading, onClose } = this.props
    const { roles } = this.state
    const { type } = metadata

    return (
      <Modal className="ManageCollectionRoleModal" onClose={onClose}>
        <ModalNavigation
          title={t(`manage_collection_role_modal.${type}.title`)}
          subtitle={t(`manage_collection_role_modal.${type}.subtitle`)}
          onClose={onClose}
        />
        <Modal.Content>
          <div className="roles">
            {roles.length > 0 ? (
              <>
                <div className="roles-list">
                  {roles.map((role, index) =>
                    role ? (
                      <Role key={index} address={role} onRemove={this.handleRemoveRole} />
                    ) : (
                      <EmptyRole
                        key={index}
                        onAdd={(role: string) => this.handleAddRole(index, role)}
                        onCancel={() => this.handleCancelNew(index)}
                      />
                    )
                  )}
                </div>
                <div className="add-roles link" onClick={this.handleAddNewRole}>
                  {t(`manage_collection_role_modal.${type}.add_new`)}
                </div>
              </>
            ) : (
              <div className="empty-roles-list">
                {t(`manage_collection_role_modal.${type}.empty`)}&nbsp;
                <span className="link" onClick={this.handleAddNewRole}>
                  {t(`manage_collection_role_modal.adding_one`)}
                </span>
              </div>
            )}
          </div>
          <ModalActions>
            <Button primary onClick={this.handleSubmit} loading={isLoading} disabled={!this.hasRoleChanged()}>
              {t('global.confirm')}
            </Button>
          </ModalActions>
        </Modal.Content>
      </Modal>
    )
  }
}
