import * as React from 'react'
import { ModalNavigation, ModalActions, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { isValid } from 'lib/address'
import { Access } from 'modules/collection/types'
import Manager from './Manager'
import EmptyManager from './EmptyManager'
import { Props, State } from './CollectionManagersModal.types'
import './CollectionManagersModal.css'

export default class CollectionManagersModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    const { collection } = this.props
    const managers = new Set(collection.managers)
    return {
      managers: Array.from(managers)
    }
  }

  handleAddNewManager = () => {
    const { managers } = this.state
    this.setState({
      managers: [...managers, undefined]
    })
  }

  handleAddManager = (index: number, manager: string) => {
    if (this.isValidManager(manager)) {
      const managers = this.removeManagerAtIndex(index)
      managers.push(manager)
      this.setState({ managers })
    }
  }

  handleRemoveManager = (manager: string) => {
    const { managers } = this.state
    this.setState({
      managers: managers.filter(_manager => _manager !== manager)
    })
  }

  handleCancelNew = (index: number) => {
    this.setState({
      managers: this.removeManagerAtIndex(index)
    })
  }

  handleSubmit = () => {
    const { collection, onSetManagers } = this.props
    const { managers } = this.state
    const accessList: Access[] = []
    for (const manager of collection.managers) {
      if (!managers.includes(manager)) {
        accessList.push({ address: manager, hasAccess: false, collection })
      }
    }
    for (const manager of managers) {
      if (!collection.managers.includes(manager!)) {
        accessList.push({ address: manager!, hasAccess: true, collection })
      }
    }
    onSetManagers(collection, accessList)
  }

  removeManagerAtIndex(index: number) {
    const { managers } = this.state
    return [...managers.slice(0, index), ...managers.slice(index + 1)]
  }

  isValidManager(manager: string) {
    return isValid(manager) && !this.state.managers.includes(manager)
  }

  render() {
    const { onClose } = this.props
    const { managers } = this.state
    return (
      <Modal name={name} className="CollectionManagersModal" onClose={onClose}>
        <ModalNavigation title={t('collaborators_modal.title')} onClose={onClose} />
        <Modal.Content>
          <div className="managers">
            {managers.length > 0 ? (
              <>
                <div className="managers-list">
                  {managers.map((manager, index) =>
                    manager ? (
                      <Manager key={index} manager={manager} onRemove={this.handleRemoveManager} />
                    ) : (
                      <EmptyManager
                        key={index}
                        onAdd={(manager: string) => this.handleAddManager(index, manager)}
                        onCancel={() => this.handleCancelNew(index)}
                      />
                    )
                  )}
                </div>
                <div className="add-managers link" onClick={this.handleAddNewManager}>
                  {t('collaborators_modal.add_collaborator')}
                </div>
              </>
            ) : (
              <div className="empty-managers-list">
                {t('collaborators_modal.no_collaborators')}&nbsp;
                <span className="link" onClick={this.handleAddNewManager}>
                  {t('collaborators_modal.adding_one')}
                </span>
              </div>
            )}
          </div>
          <ModalActions>
            <Button primary onClick={this.handleSubmit}>
              {t('global.done')}
            </Button>
          </ModalActions>
        </Modal.Content>
      </Modal>
    )
  }
}
