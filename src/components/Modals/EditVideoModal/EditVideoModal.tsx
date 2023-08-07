import React from 'react'
import { Button, Column, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getVideoURL } from 'modules/item/utils'
import { VIDEO_PATH } from 'modules/item/types'
import { AcceptedFileProps } from 'components/Modals/CreateSingleItemModal/CreateSingleItemModal.types'
import UploadVideoStep from '../CreateSingleItemModal/UploadVideoStep/UploadVideoStep'
import { EditVideoView, Props, State } from './EditVideoModal.types'
import './EditVideoModal.css'

export default class EditVideoModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    const { metadata } = this.props
    const isEmptyVideo = !(VIDEO_PATH in metadata.item.contents)

    return {
      video: null,
      view: metadata?.view ?? isEmptyVideo ? EditVideoView.UPLOAD_VIDEO : EditVideoView.VIEW_VIDEO
    }
  }

  handleDropAccepted = (acceptedFileProps: AcceptedFileProps) => {
    this.setState({
      video: (acceptedFileProps.contents as Record<string, Blob>)[VIDEO_PATH]
    })
  }

  handleOnSaveVideo = () => {
    const { metadata, onClose } = this.props
    const { onSaveVideo } = metadata
    const { video } = this.state

    if (video) {
      onSaveVideo(video)
      onClose()
    }
  }

  handleOnEdit = () => {
    this.setState({
      view: EditVideoView.UPLOAD_VIDEO
    })
  }

  renderModalTitle() {
    return t('create_single_item_modal.upload_video_step_title')
  }

  renderViewVideoStep() {
    const { metadata, onClose } = this.props
    const { item } = metadata
    return (
      <>
        <ModalNavigation title={t('video_showcase_modal.title')} onClose={onClose} />
        <Modal.Content>
          <video
            src={getVideoURL(item)}
            preload="auto"
            controls
            controlsList="nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
          />
        </Modal.Content>
        <Modal.Actions>
          <Column align="right">
            <Button primary onClick={this.handleOnEdit}>
              {t('global.edit')}
            </Button>
          </Column>
        </Modal.Actions>
      </>
    )
  }

  render() {
    const { name, onClose } = this.props
    const { view } = this.state

    return (
      <Modal name={name} onClose={onClose}>
        {view === EditVideoView.VIEW_VIDEO ? (
          this.renderViewVideoStep()
        ) : view === EditVideoView.UPLOAD_VIDEO ? (
          <UploadVideoStep
            title={this.renderModalTitle()}
            onClose={onClose}
            onDropAccepted={this.handleDropAccepted}
            onSaveVideo={this.handleOnSaveVideo}
          />
        ) : null}
      </Modal>
    )
  }
}
