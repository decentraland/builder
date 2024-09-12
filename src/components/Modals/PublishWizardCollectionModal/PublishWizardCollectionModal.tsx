import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import classNames from 'classnames'
import { List, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { withAuthorizedAction } from 'decentraland-dapps/dist/containers'
import { AuthorizedAction } from 'decentraland-dapps/dist/containers/withAuthorizedAction/AuthorizationModal'
import { ContractName } from 'decentraland-transactions'
import { AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { NFTCategory, Network } from '@dcl/schemas'
import { buildManaAuthorization } from 'lib/mana'
import { getPublishStatus, getError } from 'modules/collection/selectors'
import { PaymentMethod } from 'modules/collection/types'
import { Props, PublishWizardCollectionSteps } from './PublishWizardCollectionModal.types'
import ConfirmCollectionNameStep from './ConfirmCollectionNameStep/ConfirmCollectionNameStep'
import ConfirmCollectionItemsStep from './ConfirmCollectionItemsStep/ConfirmCollectionItemsStep'
import ReviewContentPolicyStep from './ReviewContentPolicyStep/ReviewContentPolicyStep'
import PayPublicationFeeStep from './PayPublicationFeeStep/PayPublicationFeeStep'
import CongratulationsStep from './CongratulationsStep/CongratulationsStep'
import './PublishWizardCollectionModal.css'

export const PublishWizardCollectionModal: React.FC<Props> = props => {
  const { collection, items, wallet, rarities, onClose, onFetchRarities, onPublish, onAuthorizedAction, onCloseAuthorization } = props
  const [currentStep, setCurrentStep] = useState<number>(PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME)
  const [emailAddress, setEmailAddress] = useState<string>('')
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState<boolean>(false)

  useEffect(() => {
    onFetchRarities()
  }, [onFetchRarities])

  useEffect(() => {
    if (collection.forumLink) {
      setCurrentStep(PublishWizardCollectionSteps.COLLECTION_PUBLISHED)
      onCloseAuthorization()
    }
  }, [collection.forumLink, onCloseAuthorization, setCurrentStep])

  const handleOnNextStep = useCallback(() => {
    setCurrentStep(step => step + 1)
  }, [setCurrentStep])

  const handleOnPrevStep = useCallback(() => {
    setCurrentStep(step => step - 1)
  }, [setCurrentStep])

  const handleOnChangeEmailAddress = useCallback(
    (email: string) => {
      setEmailAddress(email)
    },
    [setEmailAddress]
  )

  const handleOnSubscribeToNewsletter = useCallback(
    (value: boolean) => {
      setSubscribeToNewsletter(value)
    },
    [setSubscribeToNewsletter]
  )

  const handleOnPublish = useCallback(
    (paymentMethod: PaymentMethod) => {
      if (paymentMethod === PaymentMethod.FIAT) {
        onPublish(collection, items, emailAddress, subscribeToNewsletter, paymentMethod)
        return
      }

      const authorization = buildManaAuthorization(wallet.address, wallet.networks.MATIC.chainId, ContractName.CollectionManager)

      onAuthorizedAction({
        authorizedAddress: authorization.authorizedAddress,
        authorizedContractLabel: ContractName.CollectionManager,
        targetContract: {
          name: authorization.contractName,
          address: authorization.contractAddress,
          chainId: authorization.chainId,
          network: Network.MATIC,
          category: NFTCategory.ENS
        },
        targetContractName: ContractName.MANAToken,
        requiredAllowanceInWei: ethers.BigNumber.from(rarities[0].prices!.MANA).mul(items.length).toString(),
        authorizationType: AuthorizationType.ALLOWANCE,
        onAuthorized: () => onPublish(collection, items, emailAddress, subscribeToNewsletter, paymentMethod)
      })
    },
    [onPublish, collection, items, emailAddress, subscribeToNewsletter, wallet, rarities, onAuthorizedAction]
  )

  const renderStepView = () => {
    switch (currentStep) {
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME:
        return <ConfirmCollectionNameStep collection={collection} onNextStep={handleOnNextStep} />
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_ITEMS:
        return <ConfirmCollectionItemsStep items={items} onNextStep={handleOnNextStep} onPrevStep={handleOnPrevStep} />
      case PublishWizardCollectionSteps.REVIEW_CONTENT_POLICY:
        return (
          <ReviewContentPolicyStep
            collection={collection}
            confirmedEmailAddress={emailAddress}
            subscribeToNewsletter={subscribeToNewsletter}
            onChangeEmailAddress={handleOnChangeEmailAddress}
            onSubscribeToNewsletter={handleOnSubscribeToNewsletter}
            onNextStep={handleOnNextStep}
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

  const stepTitle = useMemo(() => {
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
  }, [t, currentStep])

  const stepIndicator = useMemo(() => {
    if (currentStep === PublishWizardCollectionSteps.COLLECTION_PUBLISHED) {
      return null
    }
    const steps = Object.values(PublishWizardCollectionSteps).filter(
      step => !isNaN(Number(step)) && step !== PublishWizardCollectionSteps.COLLECTION_PUBLISHED
    )
    const activeStepPosition = steps.findIndex(step => step === currentStep)

    return (
      <List horizontal className="steps-indicator content">
        {steps.map((step, index) => (
          <List.Item
            key={step}
            className={classNames('step', { active: currentStep === step, beforeActiveStep: index < activeStepPosition })}
          />
        ))}
      </List>
    )
  }, [currentStep])

  return (
    <Modal className="PublishWizardCollectionModal" size="small" onClose={onClose} closeOnDimmerClick={false}>
      <ModalNavigation title={stepTitle} onClose={onClose} />
      {stepIndicator}
      {renderStepView()}
    </Modal>
  )
}

export default withAuthorizedAction(
  PublishWizardCollectionModal,
  AuthorizedAction.PUBLISH_COLLECTION,
  {
    title_action: 'publish_wizard_collection_modal.authorization.title_action',
    action: 'publish_wizard_collection_modal.authorization.action',
    confirm_transaction: {
      title: 'publish_wizard_collection_modal.authorization.confirm_transaction_title'
    },
    authorize_mana: {
      description: 'publish_wizard_collection_modal.authorization.authorize_mana_description'
    },
    set_cap: {
      description: 'publish_wizard_collection_modal.authorization.set_cap_description'
    },
    insufficient_amount_error: {
      message: 'publish_wizard_collection_modal.authorization.insufficient_amount_error_message'
    }
  },
  getPublishStatus,
  getError
)
