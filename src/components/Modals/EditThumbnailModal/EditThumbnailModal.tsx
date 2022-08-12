import React from 'react'
import { Modal } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ImportStep from 'components/Modals/CreateSingleItemModal/ImportStep/ImportStep'
import EditThumbnailStep from 'components/Modals/CreateSingleItemModal/EditThumbnailStep/EditThumbnailStep'
import { AcceptedFileProps, CreateItemView } from 'components/Modals/CreateSingleItemModal/CreateSingleItemModal.types'
import { toWearableWithBlobs } from 'components/Modals/CreateSingleItemModal/utils'
import { Props, State } from './EditThumbnailModal.types'
import './EditThumbnailModal.css'

export default class EditThumbNailModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    return {
      view: CreateItemView.IMPORT,
      file: null,
      error: '',
      isLoading: false
    }
  }

  handleDropAccepted = async (acceptedFileProps: AcceptedFileProps) => {
    this.setState({
      file: acceptedFileProps.file!,
      view: CreateItemView.THUMBNAIL
    })
  }

  renderModalTitle() {
    return t('create_single_item_modal.thumbnail_step_title')
  }

  renderThumbnailView() {
    const { onClose, onSaveThumbnail } = this.props
    const { file, isLoading } = this.state

    return (
      <EditThumbnailStep
        isLoading={isLoading}
        blob={file ? toWearableWithBlobs(file, true) : undefined}
        title={this.renderModalTitle()}
        onBack={() => this.setState({ view: CreateItemView.IMPORT })}
        onSave={onSaveThumbnail}
        onClose={onClose}
      />
    )
  }

  renderImportView() {
    const { onClose } = this.props

    return <ImportStep title={this.renderModalTitle()} onDropAccepted={this.handleDropAccepted} onClose={onClose} />
  }

  renderView() {
    switch (this.state.view) {
      case CreateItemView.IMPORT:
        return this.renderImportView()
      case CreateItemView.THUMBNAIL:
        return this.renderThumbnailView()
      default:
        return null
    }
  }

  render() {
    const { name, open, onClose } = this.props

    return (
      <Modal name={name} open={open} onClose={onClose} className="EditThumbnailModal">
        {this.renderView()}
      </Modal>
    )
  }
}
