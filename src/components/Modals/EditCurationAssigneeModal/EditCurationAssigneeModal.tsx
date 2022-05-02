import React from 'react'
import { ModalNavigation, Button, Form, SelectField, DropdownProps } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { AssignModalOperationType, Props, State } from './EditCurationAssigneeModal.types'
import './EditCurationAssigneeModal.css'

const UNASSIGN_PLACEHOLDER = 'unassign'

export default class EditCurationAssigneeModal extends React.PureComponent<Props, State> {
  state: State = {
    assignee: this.props.curation?.assignee || this.props.address || null
  }

  handleOnSubmit = () => {
    const { onSetAssignee, metadata, curation } = this.props
    const { assignee } = this.state
    onSetAssignee(metadata.collectionId, assignee !== UNASSIGN_PLACEHOLDER ? assignee : null, curation)
  }

  handleChangeAssignee = (_event: React.SyntheticEvent<HTMLElement, Event>, target: DropdownProps) => {
    this.setState({ assignee: `${target.value}` })
  }

  handleClose = () => {
    const { onClose } = this.props
    onClose()
  }

  render() {
    const { name, metadata, isLoading, committeeMembers, collection, address, profiles } = this.props
    const { type } = metadata
    const { assignee } = this.state
    const isReassigning = type === AssignModalOperationType.REASSIGN
    return (
      <Modal name={name} onClose={this.handleClose}>
        <ModalNavigation
          title={
            <strong>
              <T id={`curation_page.assign_modal.${type}.title`} values={{ collection_name: collection?.name }} />
            </strong>
          }
          onClose={this.handleClose}
        />
        <Form onSubmit={this.handleOnSubmit}>
          <Modal.Content>
            <div className="details">
              {isReassigning
                ? t('curation_page.assign_modal.reassign.body')
                : t('curation_page.assign_modal.self_assign.body', {
                    emphasis: <b> {t('curation_page.assign_modal.self_assign.emphasis')} </b>
                  })}
            </div>
            {isReassigning ? (
              <SelectField
                loading={isLoading}
                label={t('curation_page.curator')}
                value={assignee ?? UNASSIGN_PLACEHOLDER}
                options={[UNASSIGN_PLACEHOLDER, ...committeeMembers].map(value => ({
                  value,
                  text:
                    value === UNASSIGN_PLACEHOLDER
                      ? `- ${t('curation_page.assign_modal.unassign')} -`
                      : value === address
                      ? `${profiles[address] ? profiles[address].avatars[0].name : value} (${t('collection_row.you')})`
                      : profiles[value]?.avatars[0].name ?? value
                }))}
                onChange={this.handleChangeAssignee}
              />
            ) : null}
          </Modal.Content>
          <Modal.Actions>
            <Button secondary onClick={this.handleClose} type="button">
              {t('global.cancel')}
            </Button>
            <Button primary type="submit" loading={isLoading}>
              {t('global.confirm')}
            </Button>
          </Modal.Actions>
        </Form>
      </Modal>
    )
  }
}
