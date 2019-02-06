import * as React from 'react'
import { Modal, Field, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './ProjectDetailsModal.types'

import './ProjectDetailsModal.css'

export default class ShortcutsModal extends React.PureComponent<Props> {
  handleOnClose = () => {
    const { modal, onClose } = this.props
    onClose(modal.name)
  }

  render() {
    const { modal, currentProject } = this.props

    return (
      <Modal open={modal.open} className="ProjectDetailsModal" size="small" onClose={this.handleOnClose}>
        <Modal.Content>
          <div className="title">{t('project_details_modal.title')}</div>

          <div className="details">
            <Field label="Title" value={currentProject.title} placeholder="Project title " />
            <Field label="Description" value={currentProject.description} placeholder="No description" />
          </div>

          <div className="button-container">
            <Button primary>Save</Button>
            <Button secondary>Cancel</Button>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}
