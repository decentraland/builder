import * as React from 'react'
import { SocialEmoteAnimation } from '@dcl/schemas/dist/dapps/preview/social-emote-animation'
import { ModalNavigation, Row, Button, Loader } from 'decentraland-ui'
import { AnimationControls, EmoteControls, TranslationControls, WearablePreview, ZoomControls } from 'decentraland-ui2'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './EditThumbnailStep.types'
import { Props, State } from './EditThumbnailStep.types'
import './EditThumbnailStep.css'

export default class EditThumbnailStep extends React.PureComponent<Props, State> {
  state: State = {
    blob: this.props.blob,
    previewController: this.props.wearablePreviewController,
    hasBeenUpdated: false,
    socialEmote: undefined
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

  handleSocialEmoteSelect = (animation: SocialEmoteAnimation) => {
    this.setState({ socialEmote: animation })
  }

  render() {
    const { onClose, onBack, title, isLoading, base64s } = this.props
    const { blob, hasBeenUpdated, socialEmote, previewController } = this.state

    let emoteData = undefined
    if (base64s && base64s.length > 0) {
      emoteData = JSON.parse(atob(base64s[0]))?.emoteDataADR74
    } else if (blob?.emoteDataADR74) {
      emoteData = blob?.emoteDataADR74
    }

    let _socialEmote = undefined
    if (!socialEmote && emoteData?.startAnimation) {
      _socialEmote = { title: 'Start Animation', ...emoteData.startAnimation }
    }

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content className="EditThumbnailStep">
          <div className="thumbnail-step-container">
            <WearablePreview
              baseUrl="https://wearable-preview-1kigg1ihg-decentraland1.vercel.app"
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
              socialEmote={socialEmote || _socialEmote}
              onLoad={this.handleFileLoad}
              onUpdate={() => this.setState({ hasBeenUpdated: true })}
            />
            {hasBeenUpdated && previewController ? (
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
            <Button disabled={!hasBeenUpdated || isLoading} onClick={onBack}>
              {t('global.back')}
            </Button>
            {hasBeenUpdated && previewController ? (
              <AnimationControls
                className="animation-controls"
                wearablePreviewId="preview"
                selectedAnimation={socialEmote}
                onSelectAnimation={this.handleSocialEmoteSelect}
              />
            ) : null}
            <Button disabled={!hasBeenUpdated || isLoading} primary loading={isLoading} onClick={this.handleSave}>
              {t('global.save')}
            </Button>
          </Row>
        </Modal.Content>
      </>
    )
  }
}
