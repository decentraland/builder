import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { PreviewMessageType, PreviewOptions, sendMessage } from '@dcl/schemas'
import { ModalNavigation, WearablePreview, Row, Button, Icon, Loader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import BuilderIcon from 'components/Icon'
import { ControlOptionAction, Props, State } from './EditThumbnailStep.types'
import './EditThumbnailStep.css'

const DEFAULT_ZOOM = 3

export default class EditThumbnailStep extends React.PureComponent<Props, State> {
  previewRef = React.createRef<WearablePreview>()
  state: State = {
    blob: this.props.blob,
    previewController: this.props.wearablePreviewController,
    hasBeenUpdated: false,
    frame: 0,
    isPlaying: false,
    disableAutoRotate: false
  }

  clearPlayingInterval = () => {
    const { playingIntervalId } = this.state
    if (playingIntervalId) {
      clearInterval(playingIntervalId)
      this.setState({ playingIntervalId: undefined })
    }
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    const { isPlaying } = this.state
    if (prevState.isPlaying && !isPlaying) {
      this.clearPlayingInterval()
    }
  }

  componentWillUnmount() {
    const { playingIntervalId } = this.state
    if (playingIntervalId) {
      clearInterval(playingIntervalId)
    }
  }

  restart = () => {
    const { length } = this.state
    this.clearPlayingInterval()
    this.setState({ isPlaying: true, frame: 0 }, () => length && this.trackFrame(length))
  }

  trackFrame = (length: number, currentFrame?: number) => {
    const { isPlaying, playingIntervalId } = this.state
    if (isPlaying && playingIntervalId) {
      return
    }

    let counter = currentFrame || 0
    let max = length * 100
    let intervalId: NodeJS.Timer
    intervalId = setInterval(() => {
      counter += 50
      const nextValue = counter >= max ? max : counter
      this.setState({ frame: nextValue, isPlaying: nextValue === max ? false : true, playingIntervalId: intervalId })
    }, 500)
  }

  handleFileLoad = async () => {
    const { hasBeenUpdated, length: currentLength } = this.state
    const controller = WearablePreview.createController('preview')
    const length = await controller.emote.getLength()
    // the emotes are being loaded twice, this is a workaround to just use the 2nd time
    if (hasBeenUpdated && !currentLength) {
      this.setState({ length, previewController: controller, isPlaying: true })
      this.trackFrame(length)
    }
  }

  handleSave = async () => {
    const { onSave } = this.props
    const { previewController } = this.state
    await previewController?.scene.getScreenshot(1024, 1024).then(screenshot => onSave(screenshot))
  }

  handleControlActionChange = (action: ControlOptionAction) => {
    const { zoom, disableAutoRotate, blob } = this.state
    const iframeContentWindow = this.previewRef.current?.iframe?.contentWindow
    if (iframeContentWindow) {
      const newOptions: PreviewOptions = { blob }
      switch (action) {
        case ControlOptionAction.ZOOM_IN: {
          const newZoom = (zoom || DEFAULT_ZOOM) + 1
          this.setState({ zoom: newZoom })
          newOptions.zoom = newZoom
          break
        }
        case ControlOptionAction.ZOOM_OUT: {
          const newZoom = (zoom || DEFAULT_ZOOM) - 1
          this.setState({ zoom: newZoom })
          newOptions.zoom = newZoom
          break
        }
        case ControlOptionAction.DISABLE_AUTOROTATE: {
          const newRotationState = !disableAutoRotate
          this.setState({ disableAutoRotate: newRotationState })
          newOptions.disableAutoRotate = newRotationState
          break
        }
        default:
          break
      }

      sendMessage(iframeContentWindow, PreviewMessageType.UPDATE, {
        options: newOptions
      })
      this.restart() // when changing options, the animation starts again. See if we can fix this later
    }
  }

  handleZoomOut = () => {
    this.setState(prevState => ({ zoom: (prevState.zoom || DEFAULT_ZOOM) - 1 }))
  }

  handlePlayPause = async () => {
    const { previewController, frame, length, isPlaying, playingIntervalId } = this.state
    if (isPlaying) {
      await previewController?.emote.pause()
      clearInterval(playingIntervalId)
      this.setState({ playingIntervalId: undefined, isPlaying: false })
    } else {
      await previewController?.emote.play()
      if (length && frame === length * 100) {
        this.setState({ frame: 0, isPlaying: true }, () => this.trackFrame(length)) // it's at the end, let's go back to the first frame
      } else {
        length && this.trackFrame(length, frame)
      }
    }
  }

  handleFrameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { previewController } = this.state
    const value = Number(e.target.value)
    this.setState({ frame: value, isPlaying: false })
    await previewController?.emote.pause()
    await previewController?.emote.goTo(value / 100)
  }

  render() {
    const { onClose, onBack, title } = this.props
    const { blob, length, frame, isPlaying, hasBeenUpdated } = this.state

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="EditThumbnailStep">
          <div className="thumbnail-step-container">
            {blob ? (
              <WearablePreview
                ref={this.previewRef}
                id="preview"
                blob={blob}
                profile="default"
                background="16141A7A"
                disableFace
                disableDefaultWearables
                skin="000000"
                wheelZoom={2}
                onLoad={this.handleFileLoad}
                onError={error => console.log(error)}
                onUpdate={() => this.setState({ hasBeenUpdated: true })}
              />
            ) : null}
            {hasBeenUpdated ? (
              <>
                <div className="zoom-controls">
                  <Button
                    className="zoom-control zoom-in-control"
                    onClick={() => this.handleControlActionChange(ControlOptionAction.ZOOM_IN)}
                  >
                    <Icon name="plus" />
                  </Button>
                  <Button
                    className="zoom-control zoom-out-control"
                    onClick={() => this.handleControlActionChange(ControlOptionAction.ZOOM_OUT)}
                  >
                    <Icon name="minus" />
                  </Button>
                </div>
                <Button
                  basic
                  className="rotate-control"
                  onClick={() => this.handleControlActionChange(ControlOptionAction.DISABLE_AUTOROTATE)}
                >
                  <BuilderIcon name="rotate" />
                </Button>

                <div className="play-controls">
                  <Button className="zoom-control play-control" onClick={this.handlePlayPause}>
                    <Icon name={isPlaying ? 'pause' : 'play'} />
                  </Button>
                  {length ? (
                    <input type="range" value={frame} max={length * 100} min={0} step="1" onChange={this.handleFrameChange} />
                  ) : null}
                </div>
              </>
            ) : (
              <Loader active size="large" />
            )}
          </div>
          {hasBeenUpdated ? (
            <Row className="thumbnail-actions">
              <Button onClick={onBack}>{t('global.back')}</Button>
              <Button primary onClick={this.handleSave}>
                {t('global.save')}
              </Button>
            </Row>
          ) : null}
        </Modal.Content>
      </>
    )
  }
}
