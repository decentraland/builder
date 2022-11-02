import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { List, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, PublishWizardCollectionSteps } from './PublishWizardCollectionModal.types'
import ConfirmCollectionNameStep from './ConfirmCollectionNameStep/ConfirmCollectionNameStep'
import ConfirmCollectionItemsStep from './ConfirmCollectionItemsStep/ConfirmCollectionItemsStep'
import ReviewContentPolicyStep from './ReviewContentPolicyStep/ReviewContentPolicyStep'
import PayPublicationFeeStep from './PayPublicationFeeStep/PayPublicationFeeStep'
import CongratulationsStep from './CongratulationsStep/CongratulationsStep'
import './PublishWizardCollectionModal.css'

export const PublishWizardCollectionModal: React.FC<Props> = props => {
  const { collection, items, onClose, onFetchRarities, onPublish } = props
  const [currentStep, setCurrentStep] = useState<number>(PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME)
  const [collectionName, setCollectionName] = useState<string>('')
  const [emailAddress, setEmailAddress] = useState<string>('')

  useEffect(() => {
    onFetchRarities()
  }, [onFetchRarities])

  useEffect(() => {
    if (collection.forumLink) {
      setCurrentStep(PublishWizardCollectionSteps.COLLECTION_PUBLISHED)
    }
  }, [collection.forumLink])

  const handleOnNextStep = () => {
    setCurrentStep(step => step + 1)
  }

  const handleOnPrevStep = () => {
    setCurrentStep(step => step - 1)
  }

  const handleOnConfirmCollectionName = (confirmedCollectionName: string) => {
    setCollectionName(confirmedCollectionName)
    handleOnNextStep()
  }

  const handleOnAcceptContentPolicy = (email: string) => {
    setEmailAddress(email)
    handleOnNextStep()
  }

  const handleOnPublish = () => {
    onPublish(collection, items, emailAddress)
  }

  const renderStepView = () => {
    switch (currentStep) {
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME:
        return (
          <ConfirmCollectionNameStep
            collection={collection}
            confirmedCollectionName={collectionName}
            onNextStep={handleOnConfirmCollectionName}
          />
        )
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_ITEMS:
        return <ConfirmCollectionItemsStep items={items} onNextStep={handleOnNextStep} onPrevStep={handleOnPrevStep} />
      case PublishWizardCollectionSteps.REVIEW_CONTENT_POLICY:
        return (
          <ReviewContentPolicyStep
            collection={collection}
            confirmedEmailAddress={emailAddress}
            onNextStep={handleOnAcceptContentPolicy}
            onPrevStep={handleOnPrevStep}
          />
        )
      case PublishWizardCollectionSteps.PAY_PUBLICATION_FEE:
        return <PayPublicationFeeStep {...props} onNextStep={handleOnPublish} onPrevStep={handleOnPrevStep} />
      case PublishWizardCollectionSteps.COLLECTION_PUBLISHED:
        return <CongratulationsStep collection={collection} onClose={onClose} />
      default:
        return null
    }
  }

  const renderStepTitle = () => {
    switch (currentStep) {
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME:
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_ITEMS:
        return t('publish_wizard_collection_modal.title_publish_collection')
      case PublishWizardCollectionSteps.REVIEW_CONTENT_POLICY:
        return t('publish_wizard_collection_modal.title_review_content_policy')
      case PublishWizardCollectionSteps.PAY_PUBLICATION_FEE:
        return t('publish_wizard_collection_modal.title_pay_publication_fee')
      case PublishWizardCollectionSteps.COLLECTION_PUBLISHED:
        return t('publish_wizard_collection_modal.title_congratulations')
      default:
        return null
    }
  }

  const renderStepsInicator = () => {
    if (currentStep === PublishWizardCollectionSteps.COLLECTION_PUBLISHED) {
      return null
    }

    return (
      <List horizontal className="steps-indicator content">
        {Object.values(PublishWizardCollectionSteps)
          .filter(step => !isNaN(Number(step)) && step !== PublishWizardCollectionSteps.COLLECTION_PUBLISHED)
          .map(step => (
            <List.Item key={step} className={classNames('step', { active: currentStep === step })} />
          ))}
      </List>
    )
  }

  return (
    <Modal className="PublishWizardCollectionModal" size="small" onClose={onClose} closeOnDimmerClick={false}>
      <ModalNavigation title={renderStepTitle()} onClose={onClose} />
      {renderStepsInicator()}
      {renderStepView()}
    </Modal>
  )
}

export default PublishWizardCollectionModal
