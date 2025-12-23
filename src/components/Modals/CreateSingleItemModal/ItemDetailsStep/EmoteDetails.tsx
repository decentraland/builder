import React, { useCallback } from 'react'
import { Row, Column, SelectField, Message, DropdownProps, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { EmotePlayMode } from '@dcl/schemas'
import { getBackgroundStyle } from 'modules/item/utils'
import { Item } from 'modules/item/types'
import Icon from 'components/Icon'
import ItemProperties from 'components/ItemProperties'
import { useCreateSingleItemModal } from '../CreateSingleItemModal.context'
import { createItemActions } from '../CreateSingleItemModal.reducer'
import CommonFields from '../CommonFields'
import { CreateItemView } from '../CreateSingleItemModal.types'
import { areEmoteMetrics } from 'modules/models/types'

/**
 * Gets play mode options for emotes
 */
const getPlayModeOptions = () => {
  const playModes: string[] = [EmotePlayMode.SIMPLE, EmotePlayMode.LOOP]

  return playModes.map(value => ({
    value,
    text: t(`emote.play_mode.${value}.text`),
    description: t(`emote.play_mode.${value}.description`)
  }))
}

const PlayModeSelectField: React.FC<{
  value: string
  onChange: DropdownProps['onChange']
}> = ({ value, onChange }) => {
  return (
    <SelectField
      required
      search={false}
      className="has-description"
      label={t('create_single_item_modal.play_mode_label')}
      placeholder={t('create_single_item_modal.play_mode_placeholder')}
      value={value}
      options={getPlayModeOptions()}
      onChange={onChange}
    />
  )
}

export const EmoteDetails: React.FC = () => {
  const {
    state,
    renderModalTitle,
    handleOpenThumbnailDialog,
    handleThumbnailChange,
    thumbnailInput,
    dispatch,
    isLoading,
    handleSubmit,
    isDisabled
  } = useCreateSingleItemModal()
  const { contents, metrics, thumbnail, rarity, playMode = '', hasScreenshotTaken } = state
  const title = renderModalTitle()
  const thumbnailStyle = getBackgroundStyle(rarity)

  const handlePlayModeChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      const value = data.value as EmotePlayMode
      dispatch(createItemActions.setPlayMode(value))
    },
    [dispatch]
  )

  const handleClickSave = useCallback(() => {
    if (hasScreenshotTaken) {
      handleSubmit()
    } else {
      dispatch(createItemActions.setFromView(CreateItemView.DETAILS))
      handleOpenThumbnailDialog()
    }
  }, [hasScreenshotTaken, handleSubmit, handleOpenThumbnailDialog, dispatch])

  return (
    <>
      <Row className="details">
        <Column>
          <Row>
            <Column className="preview" width={192} grow={false}>
              <div className="thumbnail-container">
                <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} alt={title} />
                <Icon name="camera" onClick={handleOpenThumbnailDialog} />
                <input type="file" ref={thumbnailInput} onChange={handleThumbnailChange} accept="image/png" />
              </div>
              {metrics ? <ItemProperties item={{ metrics, contents } as unknown as Item} /> : null}
            </Column>
            <Column className="data" grow={true}>
              <CommonFields />
              {metrics && areEmoteMetrics(metrics) && !metrics.additionalArmatures ? (
                <PlayModeSelectField value={playMode} onChange={handlePlayModeChange} />
              ) : null}
            </Column>
          </Row>
          <div className="notice">
            <Message info visible content={t('create_single_item_modal.emote_notice')} icon={<Icon name="alert" />} />
          </div>
        </Column>
      </Row>
      <Row className="actions" grow>
        <Column align="right">
          <Button primary disabled={isDisabled()} loading={isLoading} onClick={handleClickSave}>
            {hasScreenshotTaken ? t('global.save') : t('global.next')}
          </Button>
        </Column>
      </Row>
    </>
  )
}

export default React.memo(EmoteDetails)
