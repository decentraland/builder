import * as React from 'react'
import { PreviewType } from '@dcl/schemas'
import {
  ModalNavigation,
  WearablePreview,
  Row,
  Button,
  Loader,
  EmoteControls,
  TranslationControls,
  ZoomControls,
  VerticalPosition
} from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { ItemType } from 'modules/item/types'
import { Props, State } from './EditThumbnailStep.types'
import './EditThumbnailStep.css'

export default class EditThumbnailStep extends React.PureComponent<Props, State> {
  previewRef = React.createRef<WearablePreview>()
  state: State = {
    blob: this.props.blob,
    hasBeenUpdated: false
  }

  handleFileLoad = async () => {
    const { type } = this.props
    const { hasBeenUpdated } = this.state

    if (!hasBeenUpdated) {
      return
    }

    const controller = WearablePreview.createController('preview')

    if (type === ItemType.EMOTE) {
      await controller.emote.getLength()
    } else {
      await controller.scene.getMetrics()
    }
  }

  handleSave = async () => {
    const { type, onSave } = this.props
    const controller = WearablePreview.createController('preview')
    if (type === ItemType.EMOTE) {
      await controller.emote.pause()
    }
    const screenshot = await controller.scene.getScreenshot(1024, 1024)
    onSave(screenshot)
  }

  render() {
    const { base64s, title, type, isLoading, onBack, onClose } = this.props
    const { blob, hasBeenUpdated } = this.state
    const isEmote = type === ItemType.EMOTE

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="EditThumbnailStep">
          <div className="thumbnail-step-container">
            <WearablePreview
              ref={this.previewRef}
              id="preview"
              blob={blob}
              base64s={base64s}
              profile={isEmote ? 'default' : undefined}
              type={!isEmote ? PreviewType.WEARABLE : undefined}
              disableBackground
              disableFace
              disableDefaultWearables
              disableDefaultEmotes
              disableAutoRotate
              showThumbnailBoundaries
              skin={isEmote ? '000000' : undefined}
              zoom={100}
              wheelZoom={2}
              onLoad={this.handleFileLoad}
              onUpdate={() => this.setState({ hasBeenUpdated: true })}
            />
            {hasBeenUpdated ? (
              <>
                <ZoomControls wearablePreviewId="preview" zoomDelta={0.01} />
                <TranslationControls vertical verticalPosition={VerticalPosition.RIGHT} wearablePreviewId="preview" />
                {isEmote ? (
                  <div className="play-controls">
                    <EmoteControls className="emote-controls" wearablePreviewId="preview" />
                  </div>
                ) : null}
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
