import React, { useCallback } from 'react'
import { Row, Column, Section, Header, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { BodyShapeType, ItemType, Item } from 'modules/item/types'
import { getBackgroundStyle } from 'modules/item/utils'
import ItemDropdown from 'components/ItemDropdown'
import { createItemActions } from '../CreateSingleItemModal.reducer'
import { useCreateSingleItemModal } from '../CreateSingleItemModal.context'
import CommonFields from '../CommonFields'

export const WearableDetails: React.FC = () => {
  const {
    state,
    metadata,
    dispatch,
    renderMetrics,
    renderModalTitle,
    handleOpenThumbnailDialog,
    handleThumbnailChange,
    thumbnailInput,
    filterItemsByBodyShape,
    handleItemChange,
    isAddingRepresentation,
    handleSubmit,
    isDisabled,
    isLoading
  } = useCreateSingleItemModal()
  const { bodyShape, thumbnail, isRepresentation, rarity, item } = state
  const title = renderModalTitle()
  const thumbnailStyle = getBackgroundStyle(rarity)

  const handleYes = useCallback(() => dispatch(createItemActions.setIsRepresentation(true)), [])

  const handleNo = useCallback(() => dispatch(createItemActions.setIsRepresentation(false)), [])

  const renderCommonFields = () => <CommonFields />

  const renderExistingItemQuestion = () => (
    <Section>
      <Header sub>{t('create_single_item_modal.existing_item')}</Header>
      <Row>
        <div className={`option ${isRepresentation === true ? 'active' : ''}`} onClick={handleYes}>
          {t('global.yes')}
        </div>
        <div className={`option ${isRepresentation === false ? 'active' : ''}`} onClick={handleNo}>
          {t('global.no')}
        </div>
      </Row>
    </Section>
  )

  const renderItemDropdown = () => (
    <Section>
      <Header sub>
        {isAddingRepresentation
          ? t('create_single_item_modal.adding_representation', { bodyShape: t(`body_shapes.${bodyShape}`) })
          : t('create_single_item_modal.pick_item', { bodyShape: t(`body_shapes.${bodyShape}`) })}
      </Header>
      <ItemDropdown
        value={item as Item<ItemType.WEARABLE>}
        filter={filterItemsByBodyShape}
        onChange={handleItemChange}
        isDisabled={isAddingRepresentation}
      />
    </Section>
  )

  const renderRepresentation = useCallback(
    (type: BodyShapeType) => {
      return (
        <div
          className={`option has-icon ${type} ${type === bodyShape ? 'active' : ''}`.trim()}
          onClick={() => {
            dispatch(createItemActions.setBodyShape(type))
            dispatch(createItemActions.setIsRepresentation(metadata && metadata.changeItemFile ? false : undefined))
            dispatch(createItemActions.setItem(undefined))
          }}
        >
          {t('body_shapes.' + type)}
        </div>
      )
    },
    [bodyShape, metadata, dispatch]
  )

  const renderWearableContent = () => {
    if (!bodyShape || bodyShape === BodyShapeType.BOTH || (metadata && metadata.changeItemFile)) {
      return renderCommonFields()
    }

    return (
      <>
        {!isAddingRepresentation && renderExistingItemQuestion()}
        {isRepresentation === undefined ? null : isRepresentation ? renderItemDropdown() : renderCommonFields()}
      </>
    )
  }

  return (
    <>
      <Row className="details">
        <div className="preview">
          <div className="thumbnail-container">
            <img className="thumbnail" src={thumbnail || undefined} style={thumbnailStyle} alt={title} />
            {isRepresentation ? null : (
              <>
                <Icon name="camera" onClick={handleOpenThumbnailDialog} />
                <input type="file" ref={thumbnailInput} onChange={handleThumbnailChange} accept="image/png" />
              </>
            )}
          </div>
          {renderMetrics()}
        </div>
        <Column className="data" grow={true}>
          {isAddingRepresentation ? null : (
            <Section>
              <Header sub>{t('create_single_item_modal.representation_label')}</Header>
              <Row>
                {renderRepresentation(BodyShapeType.BOTH)}
                {renderRepresentation(BodyShapeType.MALE)}
                {renderRepresentation(BodyShapeType.FEMALE)}
              </Row>
            </Section>
          )}
          {renderWearableContent()}
        </Column>
      </Row>
      <Row className="actions" grow>
        <Column align="right">
          <Button primary disabled={isDisabled()} loading={isLoading} onClick={handleSubmit}>
            {t('global.save')}
          </Button>
        </Column>
      </Row>
    </>
  )
}

export default WearableDetails
