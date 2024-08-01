import { useMemo, useState } from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props } from './PublishThirdPartyCollectionModal.types'
import { ReviewConditionsStep } from './ReviewConditionsStep'
import { PublishingStep } from './PublishingStep'

enum Step {
  REVIEW_CONDITIONS,
  PUBLISHING
}

export const PublishThirdPartyCollectionModal = (props: Props) => {
  const {
    onClose,
    metadata: { action, collectionId, itemIds }
  } = props

  const [step, setStep] = useState(Step.REVIEW_CONDITIONS)
  const handleGoToPublishingStep = () => setStep(Step.PUBLISHING)

  const renderedStep = useMemo(() => {
    switch (step) {
      case Step.PUBLISHING:
        return <PublishingStep onClose={onClose} />
      case Step.REVIEW_CONDITIONS:
      default:
        return (
          <ReviewConditionsStep
            onClose={onClose}
            onGoToNextStep={handleGoToPublishingStep}
            action={action}
            collectionId={collectionId}
            itemIds={itemIds}
          />
        )
    }
  }, [step])

  return (
    <Modal size="large" onClose={undefined}>
      {renderedStep}
    </Modal>
  )
}
