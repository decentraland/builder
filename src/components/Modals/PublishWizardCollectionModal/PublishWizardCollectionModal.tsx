import React, { useEffect, useState } from 'react'
import { List, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, PublishWizardCollectionSteps } from './PublishWizardCollectionModal.types'
import ConfirmCollectionNameStep from './ConfirmCollectionNameStep/ConfirmCollectionNameStep'
import './PublishWizardCollectionModal.css'

export const PublishWizardCollectionModal: React.FC<Props> = props => {
  const { collection, onClose, onFetchRarities } = props
  const [currentStep, setCurrentStep] = useState<number>(PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME)

  useEffect(() => {
    if (!collection) {
      onClose()
    }

    onFetchRarities()
  }, [collection, onClose, onFetchRarities])

  const onHandleNextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const renderStepView = () => {
    switch (currentStep) {
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME:
        return <ConfirmCollectionNameStep collection={collection} onNextStep={onHandleNextStep} />
      default:
        return null
    }
  }

  const renderStepTitle = () => {
    switch (currentStep) {
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME:
        return t('publish_collection_modal_with_oracle.title')
      default:
        return null
    }
  }

  const renderStepsInicator = () => {
    return (
      <List horizontal className="steps-indicator content">
        {Object.values(PublishWizardCollectionSteps)
          .filter(step => !isNaN(Number(step)))
          .map(step => (
            <List.Item className={`step ${currentStep === step ? 'active' : ''}`.trimEnd()} />
          ))}
      </List>
    )
  }

  return (
    <Modal className="PublishWizardCollectionModal" size="small" onClose={onClose}>
      <ModalNavigation title={renderStepTitle()} onClose={onClose} />
      {renderStepsInicator()}
      {renderStepView()}
    </Modal>
  )
}

export default PublishWizardCollectionModal
