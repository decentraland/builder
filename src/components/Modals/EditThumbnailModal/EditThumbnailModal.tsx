import React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toBase64 } from 'modules/editor/utils'
import ImportStep from 'components/Modals/CreateSingleItemModal/ImportStep/ImportStep'
import EditThumbnailStep from 'components/Modals/CreateSingleItemModal/EditThumbnailStep/EditThumbnailStep'
import { AcceptedFileProps, CreateItemView } from 'components/Modals/CreateSingleItemModal/CreateSingleItemModal.types'
import { toEmoteWithBlobs } from 'components/Modals/CreateSingleItemModal/utils'
import { Props, State } from './EditThumbnailModal.types'
import './EditThumbnailModal.css'

export default class EditThumbnailModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    return {
      view: this.props.metadata.item ? CreateItemView.THUMBNAIL : CreateItemView.IMPORT,
      file: null,
      error: '',
      isLoading: false
    }
  }

  handleDropAccepted = (acceptedFileProps: AcceptedFileProps) => {
    this.setState({
      file: acceptedFileProps.file!,
      view: CreateItemView.THUMBNAIL
    })
  }

  handleOnSaveThumbnail = (thumbnail: string) => {
    const { metadata, onClose } = this.props
    const { onSaveThumbnail } = metadata

    onSaveThumbnail(thumbnail)
    onClose()
  }

  handleOnBack = () => {
    const {
      metadata: { item },
      onClose
    } = this.props
    if (item) {
      onClose()
    } else {
      this.setState({ view: CreateItemView.IMPORT })
    }
  }

  renderModalTitle() {
    return t('create_single_item_modal.thumbnail_step_title')
  }

  renderThumbnailView() {
    const {
      onClose,
      metadata: { item }
    } = this.props
    const { file, isLoading } = this.state

    let wearablePreviewProp
    if (file) {
      wearablePreviewProp = { blob: toEmoteWithBlobs({ file }) }
    } else if (item) {
      wearablePreviewProp = { base64s: [toBase64(item)] }
    }

    return (
      <EditThumbnailStep
        isLoading={isLoading}
        title={this.renderModalTitle()}
        onBack={this.handleOnBack}
        onSave={this.handleOnSaveThumbnail}
        onClose={onClose}
        {...wearablePreviewProp}
      />
    )
  }

  renderImportView() {
    const { onClose } = this.props
    const { isLoading } = this.state

    return <ImportStep title={this.renderModalTitle()} isLoading={isLoading} onDropAccepted={this.handleDropAccepted} onClose={onClose} />
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
    const { name, onClose } = this.props

    return (
      <Modal name={name} onClose={onClose}>
        {this.renderView()}
      </Modal>
    )
  }
}
