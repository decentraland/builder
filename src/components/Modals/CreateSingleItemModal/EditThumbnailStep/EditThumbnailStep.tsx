import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ModalNavigation, WearablePreview, Row, Button, Icon } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './EditThumbnailStep.types'
import './EditThumbnailStep.css'

const DEFAULT_ZOOM = 3

export default class EditThumbnailStep extends React.PureComponent<Props, State> {
  state: State = {
    previewController: this.props.wearablePreviewController,
    hasBeenUpdated: false,
    frame: 0,
    isPlaying: false
  }

  trackFrame = (length: number) => {
    let counter = 0
    let max = length * 100
    let intervalId: NodeJS.Timer
    intervalId = setInterval(() => {
      counter += 50
      const nextValue = counter >= max ? max : counter
      if (nextValue === max) {
        clearInterval(intervalId)
      }
      console.log('nextValue: ', nextValue)
      this.setState({ frame: nextValue, isPlaying: nextValue === max || !!counter })
    }, 500)
  }

  handleFileLoad = async () => {
    console.log('handling file1')
    const { hasBeenUpdated } = this.state
    const controller = WearablePreview.createController('preview')
    const length = await controller.emote.getLength()
    console.log('length obtained: ', length)
    hasBeenUpdated && this.setState({ length, previewController: controller, isPlaying: true })
    this.trackFrame(length)
  }

  handleSave() {}

  handleZoomIn = () => {
    this.setState(prevState => ({ zoom: (prevState.zoom || DEFAULT_ZOOM) + 1 }))
  }

  handleZoomOut = () => {
    this.setState(prevState => ({ zoom: (prevState.zoom || DEFAULT_ZOOM) - 1 }))
  }

  handlePlayPause = async () => {
    const { previewController, length } = this.state
    // const isPlaying = await previewController?.emote.isPlaying()
    previewController?.emote.play()
    this.setState({ frame: 0 })
    length && this.trackFrame(length)
  }

  render() {
    const { onClose, onBack, blob, title } = this.props
    console.log('rendering!')
    console.log('blob: ', blob)
    const { zoom, length, previewController, frame, isPlaying } = this.state
    console.log('previewController: ', previewController)
    console.log('frame: ', frame)

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="EditThumbnailStep">
          <div className="thumbnail-step-container">
            {blob ? (
              <WearablePreview
                id="preview"
                blob={blob}
                profile="default"
                disableBackground
                disableAutoRotate
                disableFace
                disableDefaultWearables
                skin="000000"
                wheelZoom={2}
                onLoad={this.handleFileLoad}
                zoom={zoom}
                onError={error => console.log(error)}
                onUpdate={() => this.setState({ hasBeenUpdated: true })}
              />
            ) : null}
          </div>
          <div className="zoom-controls">
            <Button className="zoom-control zoom-in-control">
              <Icon name="plus" onClick={this.handleZoomIn} />
            </Button>
            <Button className="zoom-control zoom-out-control">
              <Icon name="minus" onClick={this.handleZoomOut} />
            </Button>
          </div>
          <div className="play-controls">
            <Button className="zoom-control play-control">
              <Icon name={isPlaying ? 'pause' : 'play'} onClick={this.handlePlayPause} />
            </Button>
            {length ? (
              <>
                <input
                  type="range"
                  value={frame}
                  max={length * 100}
                  min={0}
                  step="1"
                  onChange={async e => {
                    const value = Number(e.target.value)
                    console.log('value: ', value)
                    this.setState({ frame: value })
                    await previewController?.emote.pause()
                    await previewController?.emote.goTo(value / 100)
                  }}
                />
              </>
            ) : null}
          </div>
          <Row className="thumbnail-actions">
            <Button onClick={onBack}>{t('global.back')}</Button>
            <Button primary onClick={this.handleSave}>
              {t('global.save')}
            </Button>
          </Row>
        </Modal.Content>
      </>
    )
  }
}
