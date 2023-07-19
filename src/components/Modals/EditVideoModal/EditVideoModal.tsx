import React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { VIDEO_PATH } from 'modules/item/types'
import { AcceptedFileProps } from 'components/Modals/CreateSingleItemModal/CreateSingleItemModal.types'
import UploadVideoStep from '../CreateSingleItemModal/UploadVideoStep/UploadVideoStep'
import { Props, State } from './EditVideoModal.types'
import './EditVideoModal.css'

export default class EditVideoModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    return {
      video: null
    }
  }

  handleDropAccepted = (acceptedFileProps: AcceptedFileProps) => {
    this.setState({
      video: acceptedFileProps.contents![VIDEO_PATH]
    })
  }

  handleOnSaveVideo = () => {
    const { metadata, onClose } = this.props
    const { onSaveVideo } = metadata
    const { video } = this.state

    onSaveVideo(video!)
    onClose()
  }

  renderModalTitle() {
    return t('create_single_item_modal.upload_video_step_title')
  }

  render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name} onClose={onClose}>
        <UploadVideoStep
          title={this.renderModalTitle()}
          onClose={onClose}
          onDropAccepted={this.handleDropAccepted}
          onSaveVideo={this.handleOnSaveVideo}
        />
      </Modal>
    )
  }
}
