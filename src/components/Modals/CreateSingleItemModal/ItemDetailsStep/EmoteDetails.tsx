import React, { useCallback } from 'react'
import { Row, Column, SelectField, Message, DropdownProps, Field, Checkbox, Button, Box } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { EmotePlayMode } from '@dcl/schemas'
import { getBackgroundStyle } from 'modules/item/utils'
import { EmoteOutcome, Item } from 'modules/item/types'
import Icon from 'components/Icon'
import ItemProperties from 'components/ItemProperties'
import { useCreateSingleItemModal } from '../CreateSingleItemModal.context'
import { createItemActions } from '../CreateSingleItemModal.reducer'
import CommonFields from '../CommonFields'
import { CreateItemView } from '../CreateSingleItemModal.types'

/**
 * Gets play mode options for emotes
 */
export const getPlayModeOptions = () => {
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

const OutcomeHeader: React.FC<{
  outcomeIndex: number
  onDeleteOutcome: (outcomeIndex: number) => () => void
}> = ({ outcomeIndex, onDeleteOutcome }) => {
  const canDelete = outcomeIndex > 0
  return (
    <div className="outcome-header">
      <span>Outcome {outcomeIndex + 1}</span>
      {canDelete ? (
        <Button basic onClick={onDeleteOutcome(outcomeIndex)}>
          <Icon name="delete" />
        </Button>
      ) : null}
    </div>
  )
}

const OutcomeField: React.FC<{
  outcome: EmoteOutcome
  outcomeIndex: number
  isLoading: boolean
  shouldShowRandomizeOutcome: boolean
  onAnimationChange: (outcomeIndex: number) => (event: React.ChangeEvent<HTMLInputElement>, props: any) => void
  onPlayModeChange: (outcomeIndex: number) => (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => void
  onToggleRandom: (outcomeIndex: number) => () => void
  onDeleteOutcome: (outcomeIndex: number) => () => void
}> = ({
  outcome,
  outcomeIndex,
  shouldShowRandomizeOutcome,
  isLoading,
  onAnimationChange,
  onPlayModeChange,
  onToggleRandom,
  onDeleteOutcome
}) => {
  return (
    <Box className="outcome-box" header={<OutcomeHeader outcomeIndex={outcomeIndex} onDeleteOutcome={onDeleteOutcome} />} borderless>
      <Column>
        <Field
          className="animation"
          label={'Animation'}
          value={outcome.animation}
          disabled={isLoading}
          onChange={onAnimationChange(outcomeIndex)}
        />
        <PlayModeSelectField value={outcome.loop ? EmotePlayMode.LOOP : EmotePlayMode.SIMPLE} onChange={onPlayModeChange(outcomeIndex)} />
        {shouldShowRandomizeOutcome ? (
          <Checkbox checked={!!outcome.randomize} label="Random" onClick={onToggleRandom(outcomeIndex)} />
        ) : null}
      </Column>
    </Box>
  )
}

const OutcomesSection: React.FC<{
  outcomes: EmoteOutcome[]
  isLoading: boolean
  onAnimationChange: (outcomeIndex: number) => (event: React.ChangeEvent<HTMLInputElement>, props: any) => void
  onPlayModeChange: (outcomeIndex: number) => (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => void
  onToggleRandom: (outcomeIndex: number) => () => void
  onAddOutcome: () => void
  onDeleteOutcome: (outcomeIndex: number) => () => void
}> = ({ outcomes, isLoading, onAnimationChange, onPlayModeChange, onToggleRandom, onAddOutcome, onDeleteOutcome }) => {
  const canAddMore = outcomes.length < 4
  const shouldShowRandomizeOutcome = outcomes.length > 1
  return (
    <div className="outcomes-section">
      <h5 style={{ marginTop: 0 }}>Outcomes</h5>
      {outcomes.map((outcome, index) => (
        <OutcomeField
          key={`outcome-${index}`}
          outcome={outcome}
          outcomeIndex={index}
          isLoading={isLoading}
          shouldShowRandomizeOutcome={shouldShowRandomizeOutcome}
          onAnimationChange={onAnimationChange}
          onPlayModeChange={onPlayModeChange}
          onToggleRandom={onToggleRandom}
          onDeleteOutcome={onDeleteOutcome}
        />
      ))}
      {canAddMore && (
        <Row className="add-outcome-button" align="right">
          <Button secondary size="small" onClick={onAddOutcome} disabled={isLoading}>
            Add Outcome ({outcomes.length}/4)
          </Button>
        </Row>
      )}
    </div>
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
  const { contents, metrics, thumbnail, rarity, playMode = '', outcomes = [], hasScreenshotTaken } = state
  const title = renderModalTitle()
  const thumbnailStyle = getBackgroundStyle(rarity)

  const handlePlayModeChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      const value = data.value as EmotePlayMode
      dispatch(createItemActions.setPlayMode(value))
    },
    [dispatch]
  )

  const handleOutcomeAnimationNameChange = useCallback(
    (outcomeIndex: number) => (_event: React.ChangeEvent<HTMLInputElement>, props: any) => {
      dispatch(
        createItemActions.setOutcomes(prevOutcomes => {
          const newOutcomes = [...prevOutcomes]
          newOutcomes[outcomeIndex] = { ...newOutcomes[outcomeIndex], animation: props.value }
          return newOutcomes
        })
      )
    },
    [dispatch]
  )

  const handleOutcomePlayModeChange = useCallback(
    (outcomeIndex: number) => (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      dispatch(
        createItemActions.setOutcomes(prevOutcomes => {
          const newOutcomes = [...prevOutcomes]
          newOutcomes[outcomeIndex] = { ...newOutcomes[outcomeIndex], loop: data.value === EmotePlayMode.LOOP }
          return newOutcomes
        })
      )
    },
    [dispatch]
  )

  const handleToggleRandomOutcome = useCallback(
    (outcomeIndex: number) => () => {
      dispatch(
        createItemActions.setOutcomes(prevOutcomes => {
          const newOutcomes = [...prevOutcomes]
          newOutcomes[outcomeIndex] = { ...newOutcomes[outcomeIndex], randomize: !newOutcomes[outcomeIndex].randomize }
          return newOutcomes
        })
      )
    },
    [dispatch]
  )

  const handleAddOutcome = useCallback(() => {
    dispatch(
      createItemActions.setOutcomes(prevOutcomes => {
        if (prevOutcomes.length < 4) {
          const newOutcome: EmoteOutcome = {
            animation: '',
            loop: false,
            randomize: false
          }
          return [...prevOutcomes, newOutcome]
        }
        return prevOutcomes
      })
    )
  }, [dispatch])

  const handleDeleteOutcome = useCallback(
    (outcomeIndex: number) => () => {
      dispatch(
        createItemActions.setOutcomes(prevOutcomes => {
          const newOutcomes = [...prevOutcomes]
          newOutcomes.splice(outcomeIndex, 1)
          return newOutcomes
        })
      )
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
  }, [hasScreenshotTaken, handleSubmit, handleOpenThumbnailDialog])

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
              {outcomes.length > 0 ? (
                <OutcomesSection
                  outcomes={outcomes}
                  isLoading={isLoading}
                  onAnimationChange={handleOutcomeAnimationNameChange}
                  onPlayModeChange={handleOutcomePlayModeChange}
                  onToggleRandom={handleToggleRandomOutcome}
                  onAddOutcome={handleAddOutcome}
                  onDeleteOutcome={handleDeleteOutcome}
                />
              ) : (
                <PlayModeSelectField value={playMode} onChange={handlePlayModeChange} />
              )}
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
