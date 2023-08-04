import * as React from 'react'
import { Button, Column, Loader, ModalNavigation, Row } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getExtension, toMB } from 'lib/file'
import { WrongExtensionError, VideoFileTooBigError, VideoFileTooLongError, InvalidVideoError } from 'modules/item/errors'
import { MAX_VIDEO_DURATION, MAX_VIDEO_FILE_SIZE, loadVideo } from 'modules/item/utils'
import { VIDEO_EXTENSIONS, VIDEO_PATH } from 'modules/item/types'
import FileImport from 'components/FileImport'
import { InfoIcon } from 'components/InfoIcon'
import ErrorMessage from 'components/ItemImport/ErrorMessage'
import { Props, State } from './UploadVideoStep.types'
import styles from './UploadVideoStep.module.css'

export default class UploadVideoStep extends React.PureComponent<Props, State> {
  static defaultProps = {
    required: true
  }

  state: State = this.getInitialState()

  getInitialState(): State {
    return {
      id: '',
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
      this.setState({ error, isLoading: false })
    }
  }

  handleDropRejected = (rejectedFiles: File[]) => {
    console.warn('rejected', rejectedFiles)
    const error = new InvalidVideoError()
    this.setState({ error })
  }

  renderDropzoneCTA = (open: (event: React.MouseEvent) => void) => {
    const { isLoading, error } = this.state

    return (
      <>
        {isLoading ? (
          <div className={styles.overlay}>
            <Loader active size="big" />
          </div>
        ) : null}
        <ErrorMessage error={error} />
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
    const { contents, onDropAccepted } = this.props

    if (this.state.video) {
      URL.revokeObjectURL(this.state.video)
      this.setState({ video: undefined, isLoading: false })

      if (contents && VIDEO_PATH in contents) {
        delete contents[VIDEO_PATH]
      }

      onDropAccepted({
        video: undefined,
        contents: {
          ...contents
        }
      })
    }
  }

  render() {
    const { title, required, onBack, onClose, onSaveVideo } = this.props
    const { id, isLoading, video } = this.state

    return (
      <>
        <ModalNavigation title={title} onBack={video ? this.handleGoBack : onBack} onClose={onClose} />
        <Modal.Content>
          {(!video || id) && (
            <FileImport
              className={styles.dropzone}
              accept={VIDEO_EXTENSIONS}
              onAcceptedFiles={this.handleDropAccepted}
              onRejectedFiles={this.handleDropRejected}
              renderAction={this.renderDropzoneCTA}
              disabled={isLoading}
            />
          )}
          {video && (
            <div className={styles.dropzone}>
              <video src={video} className={styles.video} autoPlay controls loop muted playsInline />
            </div>
          )}
        </Modal.Content>
        {(video || !required) && (
          <Modal.Actions className={styles.actions}>
            <Row grow>
              <Column grow shrink>
                <Button onClick={this.handleGoBack}>{t('global.back')}</Button>
              </Column>
              <Column align="right">
                <Button primary onClick={onSaveVideo}>
                  {required || video ? t('global.save') : t('global.skip')}
                </Button>
              </Column>
            </Row>
          </Modal.Actions>
        )}
      </>
    )
  }
}
