import * as React from 'react'
import { ModalNavigation, Row, Button, Loader } from 'decentraland-ui'
import { EmoteControls, TranslationControls, WearablePreview, ZoomControls } from 'decentraland-ui2'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './EditThumbnailStep.types'
import './EditThumbnailStep.css'

const DEFAULT_ZOOM = 2

export default class EditThumbnailStep extends React.PureComponent<Props, State> {
  state: State = {
    zoom: DEFAULT_ZOOM,
    blob: this.props.blob,
    previewController: undefined,
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

  render() {
    const { onClose, onBack, title, isLoading, base64s } = this.props
    const { blob, hasBeenUpdated } = this.state

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="EditThumbnailStep">
          <div className="thumbnail-step-container">
            <WearablePreview
              id="preview"
              blob={blob}
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
                <ZoomControls className="zoom-controls" wearablePreviewId="preview" />
                <TranslationControls className="translation-controls" vertical wearablePreviewId="preview" />
                <EmoteControls className="emote-controls" wearablePreviewId="preview" />
              </>
            ) : (
              <Loader active size="large" />
            )}
          </div>
          <Row className="thumbnail-actions">
            <Button disabled={!hasBeenUpdated} onClick={onBack}>
              {t('global.back')}
            </Button>
            <Button disabled={!hasBeenUpdated} primary loading={isLoading} onClick={this.handleSave}>
              {t('global.save')}
            </Button>
          </Row>
        </Modal.Content>
      </>
    )
  }
}
