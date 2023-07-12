import * as React from 'react'
import { Button, Loader, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import FileImport from 'components/FileImport'
import { InfoIcon } from 'components/InfoIcon'
import { getExtension, toMB } from 'lib/file'
import { WrongExtensionError, VideoFileTooBigError, VideoFileTooLongError, InvalidVideoError } from 'modules/item/errors'
import { MAX_VIDEO_DURATION, MAX_VIDEO_FILE_SIZE } from 'modules/item/utils'
import { VIDEO_EXTENSIONS, VIDEO_PATH } from 'modules/item/types'
import { Props, State } from './UploadVideoStep.types'
import styles from './UploadVideoStep.module.css'

const loadVideo = (file: File): Promise<HTMLVideoElement> =>
  new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = function () {
        resolve(video)
      }

      video.onerror = function () {
        reject('Invalid video. Please select a video file.')
      }

      video.src = URL.createObjectURL(file)
    } catch (e) {
      reject(e)
    }
  })

export default class UploadVideoStep extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    return {
      id: '',
      error: '',
      isLoading: false
    }
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    const { contents, onDropAccepted } = this.props

    const file = acceptedFiles[0]
    const extension = getExtension(file.name)

    try {
      this.setState({ isLoading: true, error: undefined, video: undefined })

      if (!extension) {
        throw new WrongExtensionError()
      }

      if (file.size > MAX_VIDEO_FILE_SIZE) {
        throw new VideoFileTooBigError()
      }

      const video = await loadVideo(file)
      if (video.duration > MAX_VIDEO_DURATION) {
        throw new VideoFileTooLongError()
      }

      this.setState({ video: video.src, isLoading: false })

      onDropAccepted({
        video: video.src,
        contents: {
          ...contents,
          [VIDEO_PATH]: file
        }
      })
    } catch (error) {
      this.setState({ error: error.message, isLoading: false })
    }
  }

  handleDropRejected = (rejectedFiles: File[]) => {
    console.warn('rejected', rejectedFiles)
    const error = new InvalidVideoError()
    this.setState({ error: error.message })
  }

  renderDropzoneCTA = (open: () => void) => {
    const { isLoading, error } = this.state

    return (
      <>
        {isLoading ? (
          <div className="overlay">
            <Loader active size="big" />
          </div>
        ) : null}
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon} />
            <div className={styles.errorMessage}>{error}</div>
          </div>
        )}
        <T
          id="upload_video.cta"
          values={{
            extensions: VIDEO_EXTENSIONS.join(', '),
            action: (
              <span className="action" onClick={open}>
                {t('upload_video.upload_manually')}
              </span>
            )
          }}
        />
        <div className={styles.zipInfo}>
          <InfoIcon className={styles.infoIcon} />
          {t('create_single_item_modal.upload_video_information', {
            max_size: `${toMB(MAX_VIDEO_FILE_SIZE)}MB`,
            max_duration: MAX_VIDEO_DURATION
          })}
        </div>
      </>
    )
  }

  handleGoBack = () => {
    if (this.state.video) {
      URL.revokeObjectURL(this.state.video)
      this.setState({ video: undefined, isLoading: false })
    }
  }

  render() {
    const { title, onClose, onSaveVideo } = this.props
    const { id, video } = this.state

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content>
          {(!video || id) && (
            <FileImport
              className={styles.dropzone}
              accept={VIDEO_EXTENSIONS}
              onAcceptedFiles={this.handleDropAccepted}
              onRejectedFiles={this.handleDropRejected}
              renderAction={this.renderDropzoneCTA}
            />
          )}
          {video && (
            <div className={styles.dropzone}>
              <video src={video} className={styles.video} autoPlay controls loop muted playsInline />
            </div>
          )}
        </Modal.Content>
        {video && (
          <Modal.Actions className={styles.actions}>
            <Button onClick={this.handleGoBack}>{t('global.back')}</Button>
            <Button primary onClick={onSaveVideo}>
              {t('global.save')}
            </Button>
          </Modal.Actions>
        )}
      </>
    )
  }
}
