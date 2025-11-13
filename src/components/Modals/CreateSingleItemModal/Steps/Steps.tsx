import React, { useCallback, useEffect } from 'react'
import EditPriceAndBeneficiaryModal from '../../EditPriceAndBeneficiaryModal'
import ImportStep from '../ImportStep/ImportStep'
import EditThumbnailStep from '../EditThumbnailStep/EditThumbnailStep'
import { ItemDetailsStep } from '../ItemDetailsStep'
import { toEmoteWithBlobs } from '../utils'
import { createItemActions } from '../CreateSingleItemModal.reducer'
import { CreateItemView } from '../CreateSingleItemModal.types'
import { useCreateSingleItemModal } from '../CreateSingleItemModal.context'

interface StepsProps {
  modalContainer: React.RefObject<HTMLDivElement>
}

export const Steps: React.FC<StepsProps> = ({ modalContainer }) => {
  const {
    state,
    metadata,
    collection,
    onClose,
    dispatch,
    isLoading,
    handleSubmit,
    handleDropAccepted,
    handleOnScreenshotTaken,
    renderWearablePreview,
    renderModalTitle
  } = useCreateSingleItemModal()

  const { view } = state

  // TODO: Refactor this logic to a callback that calls the handleSubmit function
  // and pass to the handleSubmit the required parameters
  useEffect(() => {
    if (state.fromView === CreateItemView.DETAILS && state.hasScreenshotTaken) {
      handleSubmit()
    } else if (!state.fromView && state.view === CreateItemView.THUMBNAIL && state.hasScreenshotTaken) {
      dispatch(createItemActions.setView(CreateItemView.DETAILS))
    }
  }, [state, handleSubmit])

  // Thumbnail editing handlers
  const handleThumbnailGoBack = useCallback(() => {
    dispatch(createItemActions.setView(CreateItemView.DETAILS))
    dispatch(createItemActions.setFromView(undefined))
  }, [dispatch])

  const handleSaveThumbnail = useCallback(
    (screenshot: string) => {
      handleOnScreenshotTaken(screenshot)
    },
    [state, dispatch]
  )

  const renderView = useCallback(() => {
    switch (view) {
      case CreateItemView.IMPORT:
        return (
          <ImportStep
            collection={collection}
            category={state.category as any}
            metadata={metadata && metadata.item ? { item: metadata.item, changeItemFile: metadata.changeItemFile || false } : undefined}
            title={renderModalTitle()}
            wearablePreviewComponent={<div className="importer-thumbnail-container">{renderWearablePreview()}</div>}
            isLoading={!!state.isLoading}
            isRepresentation={!!state.isRepresentation}
            onDropAccepted={handleDropAccepted}
            onClose={onClose}
          />
        )

      case CreateItemView.DETAILS:
        return <ItemDetailsStep />

      case CreateItemView.THUMBNAIL:
        return (
          <EditThumbnailStep
            isLoading={!!state.isLoading || isLoading}
            blob={
              state.contents
                ? toEmoteWithBlobs({ contents: state.contents, startAnimation: state.startAnimation, outcomes: state.outcomes })
                : undefined
            }
            title={renderModalTitle()}
            onBack={handleThumbnailGoBack}
            onSave={handleSaveThumbnail}
            onClose={onClose}
          />
        )

      case CreateItemView.SET_PRICE:
        return (
          <EditPriceAndBeneficiaryModal
            name={'EditPriceAndBeneficiaryModal'}
            metadata={{ itemId: state.item!.id }}
            item={state.item!}
            itemSortedContents={state.itemSortedContents}
            onClose={() => {
              onClose()
              return { type: 'Close modal', payload: { name: 'EditPriceAndBeneficiaryModal' } }
            }}
            mountNode={modalContainer.current ?? undefined}
            onSkip={handleSubmit}
          />
        )

      default:
        return null
    }
  }, [view, state, modalContainer, isLoading, handleDropAccepted, handleOnScreenshotTaken])

  return renderView()
}

export default Steps
