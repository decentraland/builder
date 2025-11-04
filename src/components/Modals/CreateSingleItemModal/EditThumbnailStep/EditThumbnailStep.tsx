import * as React from 'react'
import { ModalNavigation, Row, Button, Icon, Loader, EmoteControls, WearablePreview } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { ControlOptionAction, Props, State } from './EditThumbnailStep.types'
import './EditThumbnailStep.css'

const DEFAULT_ZOOM = 2
const ZOOM_DELTA = 0.1

export default class EditThumbnailStep extends React.PureComponent<Props, State> {
  previewRef = React.createRef<WearablePreview>()
  state: State = {
    zoom: DEFAULT_ZOOM,
    blob: this.props.blob,
    previewController: this.props.wearablePreviewController,
    hasBeenUpdated: false
  }

  componentWillUnmount() {
    const { playingIntervalId } = this.state
    if (playingIntervalId) {
      clearInterval(playingIntervalId)
    }
  }

  handleFileLoad = async () => {
    const { hasBeenUpdated } = this.state
    const controller = WearablePreview.createController('preview')
    const length = await controller.emote.getLength()
    // the emotes are being loaded twice, this is a workaround to just use the 2nd time
    if (length > 0 && hasBeenUpdated) {
      this.setState({ previewController: controller })
    }
  }

  handleSave = async () => {
    const { onSave } = this.props
    const { previewController } = this.state
    await previewController?.emote.pause()
    await previewController?.scene.getScreenshot(1024, 1024).then(screenshot => onSave(screenshot))
  }

  handleControlActionChange = async (action: ControlOptionAction, value?: number) => {
    const { previewController } = this.state
    const iframeContentWindow = this.previewRef.current?.iframe?.contentWindow
    if (iframeContentWindow) {
      await previewController?.emote.pause()
      switch (action) {
        case ControlOptionAction.PAN_CAMERA_Y: {
          this.setState({ offsetY: value })
          await previewController?.scene.panCamera({ y: value! * -1 })
          break
        }
        case ControlOptionAction.ZOOM_IN: {
          await previewController?.scene.changeZoom(ZOOM_DELTA)
          break
        }
        case ControlOptionAction.ZOOM_OUT: {
          await previewController?.scene.changeZoom(-ZOOM_DELTA)
          break
        }
        default:
          break
      }
    }
  }

  handleZoomOut = () => {
    this.setState(prevState => ({ zoom: (prevState.zoom || DEFAULT_ZOOM) - 1 }))
  }

  render() {
    const { onClose, onBack, title, isLoading, base64s } = this.props
    const { blob, hasBeenUpdated } = this.state

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="EditThumbnailStep">
          <div className="thumbnail-step-container">
            <WearablePreview
              ref={this.previewRef}
              id="preview"
              blob={blob as any} // TODO: Remove any
              base64s={base64s}
              profile="default"
              disableBackground
              disableFace
              disableDefaultWearables
              disableDefaultEmotes
              disableAutoRotate
              showThumbnailBoundaries
              skin="000000"
              zoom={100}
              wheelZoom={2}
              onLoad={this.handleFileLoad}
              onUpdate={() => this.setState({ hasBeenUpdated: true })}
            />
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
                <div className="y-slider-container">
                  <Icon className="arrows alternate horizontal" />
                  <input
                    step={0.1}
                    min={-2}
                    max={2}
                    type="range"
                    className="y-slider"
                    onChange={e => this.handleControlActionChange(ControlOptionAction.PAN_CAMERA_Y, Number(e.target.value))}
                  ></input>
                </div>

                <div className="play-controls">
                  <EmoteControls className="emote-controls" wearablePreviewId="preview" />
                </div>
              </>
            ) : (
              <Loader active size="large" />
            )}
          </div>
          <Row className="thumbnail-actions">
            <Button disabled={!hasBeenUpdated || isLoading} onClick={onBack}>
              {t('global.back')}
            </Button>
            <Button disabled={!hasBeenUpdated || isLoading} primary loading={isLoading} onClick={this.handleSave}>
              {t('global.save')}
            </Button>
          </Row>
        </Modal.Content>
      </>
    )
  }
}
