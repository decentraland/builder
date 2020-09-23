import * as React from 'react'
import { ModalNavigation, ModalActions, Button, Field } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { isValid, shorten } from 'lib/address'
import { Access } from 'modules/collection/types'
import Profile from 'components/Profile'
import { Props } from './CollaboratorsModal.types'
import './CollaboratorsModal.css'

type State = {
  collaborators: string[]
}

export default class CollaboratorsModal extends React.PureComponent<Props> {
  state: State = this.getInitialState()

  getInitialState(): State {
    const { collection } = this.props
    const collaborators = new Set(collection.managers)
    return {
      collaborators: Array.from(collaborators)
    }
  }

  handleAddNewCollaborator = () => {
    const { collaborators } = this.state
    this.setState({
      collaborators: [...collaborators, undefined]
    })
  }

  handleAddCollaborator = (index: number, collaborator: string) => {
    if (this.isValidCollaborator(collaborator)) {
      const collaborators = this.removeCollaboratorAtIndex(index)
      collaborators.push(collaborator)
      this.setState({ collaborators })
    }
  }

  handleRemoveCollaborator = (collaborator: string) => {
    const { collaborators } = this.state
    this.setState({
      collaborators: collaborators.filter(_collaborator => _collaborator !== collaborator)
    })
  }

  handleCancelNew = (index: number) => {
    this.setState({
      collaborators: this.removeCollaboratorAtIndex(index)
    })
  }

  handleSubmit = () => {
    const { collection, onSetCollaborators } = this.props
    const { collaborators } = this.state
    const accessList: Access[] = []
    for (const collaborator of collection.managers) {
      if (!collaborators.includes(collaborator)) {
        accessList.push({ address: collaborator, hasAccess: false, collection })
      }
    }
    for (const collaborator of collaborators) {
      if (!collection.managers.includes(collaborator)) {
        accessList.push({ address: collaborator, hasAccess: true, collection })
      }
    }
    onSetCollaborators(collection, accessList)
  }

  removeCollaboratorAtIndex(index: number) {
    const { collaborators } = this.state
    return [...collaborators.slice(0, index), ...collaborators.slice(index + 1)]
  }

  isValidCollaborator(collaborator: string) {
    return isValid(collaborator) && !this.state.collaborators.includes(collaborator)
  }

  render() {
    const { onClose } = this.props
    const { collaborators } = this.state
    return (
      <Modal name={name} className="CollaboratorsModal" onClose={onClose}>
        <ModalNavigation title={t('collaborators_modal.title')} onClose={onClose} />
        <Modal.Content>
          <div className="collaborators">
            {collaborators.length > 0 ? (
              <>
                <div className="collaborators-list">
                  {collaborators.map((collaborator, index) =>
                    collaborator ? (
                      <Collaborator key={index} collaborator={collaborator} onRemove={this.handleRemoveCollaborator} />
                    ) : (
                      <EmptyCollaborator
                        key={index}
                        onAdd={(collaborator: string) => this.handleAddCollaborator(index, collaborator)}
                        onCancel={() => this.handleCancelNew(index)}
                      />
                    )
                  )}
                </div>
                <div className="add-collaborators link" onClick={this.handleAddNewCollaborator}>
                  {t('collaborators_modal.add_collaborator')}
                </div>
              </>
            ) : (
              <div className="empty-collaborators-list">
                {t('collaborators_modal.no_collaborators')}&nbsp;
                <span className="link" onClick={this.handleAddNewCollaborator}>
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

type EmptyCollaboratorProps = {
  onAdd: (collaborator: string) => void
  onCancel: () => void
}
type EmptyCollaboratorState = {
  collaborator: string
}
class EmptyCollaborator extends React.PureComponent<EmptyCollaboratorProps, EmptyCollaboratorState> {
  state = {
    collaborator: ''
  }

  handleAdd = () => {
    const { onAdd } = this.props
    const { collaborator } = this.state
    onAdd(collaborator)
  }

  handleCancel = () => {
    const { onCancel } = this.props
    onCancel()
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      collaborator: event.target.value
    })
  }

  render() {
    const { collaborator } = this.state
    return (
      <div className="EmptyCollaborator">
        <Field className="rounded" type="address" value={collaborator} onChange={this.handleChange} placeholder="0x..." />
        <span className="action link" onClick={this.handleAdd}>
          {t('global.add')}
        </span>
        <span className="action link" onClick={this.handleCancel}>
          {t('global.cancel')}
        </span>
      </div>
    )
  }
}

type CollaboratorProps = {
  collaborator: string
  onRemove: (collaborator: string) => void
}
class Collaborator extends React.PureComponent<CollaboratorProps> {
  handleRemove = () => {
    const { collaborator, onRemove } = this.props
    onRemove(collaborator)
  }

  render() {
    const { collaborator } = this.props
    return (
      <div className="Collaborator">
        <div className="info">
          <Profile address={collaborator} blockieOnly={true} />
          {shorten(collaborator)}
        </div>
        <span className="action link" onClick={this.handleRemove}>
          {t('global.delete')}
        </span>
      </div>
    )
  }
}
