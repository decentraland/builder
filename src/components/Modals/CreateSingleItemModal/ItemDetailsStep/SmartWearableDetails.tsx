import React, { useCallback } from 'react'
import { Row, Header, Message, Column, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getBackgroundStyle } from 'modules/item/utils'
import Icon from 'components/Icon'
import ItemVideo from 'components/ItemVideo'
import ItemRequiredPermission from 'components/ItemRequiredPermission'
import { useCreateSingleItemModal } from '../CreateSingleItemModal.context'
import { CreateItemView } from '../CreateSingleItemModal.types'
import CommonFields from '../CommonFields'
import { createItemActions } from '../CreateSingleItemModal.reducer'

export const SmartWearableDetails: React.FC = () => {
  const {
    state,
    dispatch,
    renderMetrics,
    renderModalTitle,
    handleOpenThumbnailDialog,
    handleThumbnailChange,
    thumbnailInput,
    handleSubmit,
    isDisabled,
    isLoading
  } = useCreateSingleItemModal()
  const { thumbnail, rarity, requiredPermissions, video } = state
  const title = renderModalTitle()
  const thumbnailStyle = getBackgroundStyle(rarity)

  const handleOpenVideoDialog = useCallback(() => {
    dispatch(createItemActions.setView(CreateItemView.UPLOAD_VIDEO))
    dispatch(createItemActions.setFromView(CreateItemView.DETAILS))
  }, [])

  return (
    <>
      <Row className="details">
        <div className="data smart-wearable">
          <CommonFields />
          {requiredPermissions?.length ? (
            <div className="required-permissions">
              <Header sub className="field-header">
                {t('create_single_item_modal.smart_wearable_permissions_label')}
                <a
                  href="https://docs.decentraland.org/creator/development-guide/sdk7/scene-metadata/#required-permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="learn-more"
                >
                  {t('global.learn_more')}
                </a>
              </Header>
              <ItemRequiredPermission requiredPermissions={requiredPermissions} basic />
            </div>
          ) : null}
          <Row className="previews">
            <div className="thumbnail-preview-container">
              <Header sub>{t('create_single_item_modal.thumbnail_preview_title')}</Header>
              <div className="preview">
                <div className="thumbnail-container">
                  <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} alt={title} />
                  <Icon name="camera" onClick={handleOpenThumbnailDialog} />
                  <input type="file" ref={thumbnailInput} onChange={handleThumbnailChange} accept="image/png" />
                </div>
                <div className="thumbnail-metrics">{renderMetrics()}</div>
              </div>
            </div>

            <div className="video-preview-container">
              <Header sub>{t('create_single_item_modal.video_preview_title')}</Header>
              <div className="preview">
                <ItemVideo
                  src={video}
                  showMetrics
                  previewIcon={<Icon name="play" onClick={handleOpenVideoDialog} />}
                  onClick={handleOpenVideoDialog}
                />
              </div>
            </div>
          </Row>
          <div className="notice">
            <Message info visible content={t('create_single_item_modal.smart_wearable_notice')} icon={<Icon name="alert" />} />
          </div>
        </div>
      </Row>
      <Row className="actions" grow>
        <Column grow shrink>
          <Button disabled={isDisabled()} onClick={() => dispatch(createItemActions.setView(CreateItemView.UPLOAD_VIDEO))}>
            {t('global.back')}
          </Button>
        </Column>
        <Column align="right">
          <Button primary disabled={isDisabled()} loading={isLoading} onClick={handleSubmit}>
            {t('global.save')}
          </Button>
        </Column>
      </Row>
    </>
  )
}

export default React.memo(SmartWearableDetails)
