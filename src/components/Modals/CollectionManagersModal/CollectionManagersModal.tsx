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

  handleAddManager = (index: number, collaborator: string) => {
    if (this.isValidManager(collaborator)) {
      const managers = this.removeManagerAtIndex(index)
      managers.push(collaborator)
      this.setState({ managers })
    }
  }

  handleRemoveManager = (collaborator: string) => {
    const { managers } = this.state
    this.setState({
      managers: managers.filter(_collaborator => _collaborator !== collaborator)
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
    for (const collaborator of collection.managers) {
      if (!managers.includes(collaborator)) {
        accessList.push({ address: collaborator, hasAccess: false, collection })
      }
    }
    for (const collaborator of managers) {
      if (!collection.managers.includes(collaborator!)) {
        accessList.push({ address: collaborator!, hasAccess: true, collection })
      }
    }
    onSetManagers(collection, accessList)
  }

  removeManagerAtIndex(index: number) {
    const { managers } = this.state
    return [...managers.slice(0, index), ...managers.slice(index + 1)]
  }

  isValidManager(collaborator: string) {
    return isValid(collaborator) && !this.state.managers.includes(collaborator)
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
                  {managers.map((collaborator, index) =>
                    collaborator ? (
                      <Manager key={index} collaborator={collaborator} onRemove={this.handleRemoveManager} />
                    ) : (
                      <EmptyManager
                        key={index}
                        onAdd={(collaborator: string) => this.handleAddManager(index, collaborator)}
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
