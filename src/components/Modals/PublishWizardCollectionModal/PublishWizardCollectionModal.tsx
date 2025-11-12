import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import classNames from 'classnames'
import { List, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { withAuthorizedAction } from 'decentraland-dapps/dist/containers'
import { WithAuthorizedActionProps } from 'decentraland-dapps/dist/containers/withAuthorizedAction'
import { AuthorizedAction } from 'decentraland-dapps/dist/containers/withAuthorizedAction/AuthorizationModal'
import { ContractName } from 'decentraland-transactions'
import { AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { NFTCategory, Network } from '@dcl/schemas'
import { buildManaAuthorization } from 'lib/mana'
import { extractThirdPartyId } from 'lib/urn'
import { getPublishStatus, getError } from 'modules/collection/selectors'
import { PaymentMethod } from 'modules/collection/types'
import { isTPCollection } from 'modules/collection/utils'
import { getThirdPartyPublishStatus } from 'modules/thirdParty/selectors'
import { Cheque } from 'modules/thirdParty/types'
import { getPublishItemsSignature } from 'modules/thirdParty/utils'
import { Props, PublishWizardCollectionSteps } from './PublishWizardCollectionModal.types'
import ConfirmCollectionNameStep from './ConfirmCollectionNameStep/ConfirmCollectionNameStep'
import ConfirmCollectionItemsStep from './ConfirmCollectionItemsStep/ConfirmCollectionItemsStep'
import ReviewContentPolicyStep from './ReviewContentPolicyStep/ReviewContentPolicyStep'
import PayPublicationFeeStep from './PayPublicationFeeStep/PayPublicationFeeStep'
import CongratulationsStep from './CongratulationsStep/CongratulationsStep'
import './PublishWizardCollectionModal.css'

export const PublishWizardCollectionModal: React.FC<Props & WithAuthorizedActionProps> = props => {
  const {
    collection,
    itemsToPublish,
    itemsWithChanges,
    wallet,
    isLoading,
    price: itemPrice,
    isPublishingFinished,
    isOffchainPublicItemOrdersEnabled,
    onClose,
    onFetchPrice,
    onPublish,
    onAuthorizedAction,
    onCloseAuthorization
  } = props
  const [currentStep, setCurrentStep] = useState<number>(PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME)
  const [emailAddress, setEmailAddress] = useState<string>('')
  const [cheque, setCheque] = useState<Cheque | undefined>(undefined)
  const [isSigningCheque, setIsSigningCheque] = useState<boolean>(false)
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState<boolean>(false)
  const isThirdParty = useMemo(() => isTPCollection(collection), [collection])
  const allItems = useMemo(() => [...itemsToPublish, ...itemsWithChanges], [itemsToPublish, itemsWithChanges])

  useEffect(() => {
    onFetchPrice()
  }, [onFetchPrice])

  useEffect(() => {
    if (isPublishingFinished) {
      setCurrentStep(PublishWizardCollectionSteps.COLLECTION_PUBLISHED)
      onCloseAuthorization()
    } else if (collection.forumLink && isThirdParty) {
      setCurrentStep(PublishWizardCollectionSteps.CONFIRM_COLLECTION_ITEMS)
    }
  }, [isPublishingFinished, isThirdParty, onCloseAuthorization, setCurrentStep])

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

  const handleOnConfirmItemsNextStep = useCallback(async () => {
    if (!cheque && isThirdParty) {
      setIsSigningCheque(true)
      try {
        const cheque = await getPublishItemsSignature(extractThirdPartyId(collection.urn), itemsToPublish.length)
        setCheque(cheque)
        handleOnNextStep()
      } catch (_) {
        setCheque(undefined)
      } finally {
        setIsSigningCheque(false)
      }
    } else {
      handleOnNextStep()
    }
  }, [isThirdParty, handleOnNextStep, cheque, setCheque, setIsSigningCheque, collection.urn, itemsToPublish.length])

  const handleOnSubscribeToNewsletter = useCallback(
    (value: boolean) => {
      setSubscribeToNewsletter(value)
    },
    [setSubscribeToNewsletter]
  )

  const handleOnPublish = useCallback(
    (paymentMethod: PaymentMethod, priceToPayInWei: string, creditsAmount = '0') => {
      if (!itemPrice?.item.mana) {
        return
      }

      if (paymentMethod === PaymentMethod.FIAT || priceToPayInWei === ethers.BigNumber.from('0').toString()) {
        onPublish(
          emailAddress,
          subscribeToNewsletter,
          paymentMethod,
          cheque,
          priceToPayInWei,
          itemPrice.programmatic?.minSlots,
          creditsAmount
        )
        return
      }

      // If using credits, we need to authorize the CreditsManager instead of the regular contract
      const contractName =
        BigInt(creditsAmount) > BigInt(0)
          ? ContractName.CreditsManager
          : isThirdParty
          ? ContractName.ThirdPartyRegistry
          : ContractName.CollectionManager

      const authorization = buildManaAuthorization(wallet.address, wallet.networks.MATIC.chainId, contractName)

      onAuthorizedAction({
        manual: wallet.network === Network.MATIC,
        authorizedAddress: authorization.authorizedAddress,
        authorizedContractLabel: contractName,
        targetContract: {
          name: authorization.contractName,
          address: authorization.contractAddress,
          chainId: authorization.chainId,
          network: Network.MATIC,
          category: NFTCategory.ENS
        },
        targetContractName: ContractName.MANAToken,
        requiredAllowanceInWei: priceToPayInWei,
        authorizationType: AuthorizationType.ALLOWANCE,
        onAuthorized: () => {
          onPublish(
            emailAddress,
            subscribeToNewsletter,
            paymentMethod,
            cheque,
            priceToPayInWei,
            itemPrice.programmatic?.minSlots,
            creditsAmount
          )
        }
      })
    },
    [
      onPublish,
      cheque,
      collection,
      itemsToPublish,
      emailAddress,
      subscribeToNewsletter,
      wallet,
      itemPrice,
      isThirdParty,
      onAuthorizedAction
    ]
  )

  const renderStepView = () => {
    switch (currentStep) {
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME:
        return <ConfirmCollectionNameStep collection={collection} onNextStep={handleOnNextStep} />
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_ITEMS:
        return (
          <ConfirmCollectionItemsStep
            isSigningCheque={isSigningCheque}
            collection={collection}
            items={allItems}
            isThirdParty={isThirdParty}
            isOffchainPublicItemOrdersEnabled={isOffchainPublicItemOrdersEnabled}
            onNextStep={handleOnConfirmItemsNextStep}
            onPrevStep={handleOnPrevStep}
          />
        )
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
        return <CongratulationsStep collection={collection} itemsCount={allItems.length} onClose={onClose} />
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
    <Modal className="PublishWizardCollectionModal" size="large" onClose={isLoading ? undefined : onClose} closeOnDimmerClick={false}>
      <ModalNavigation title={stepTitle} onClose={isLoading ? undefined : onClose} />
      {stepIndicator}
      {renderStepView()}
    </Modal>
  )
}

const AUTHORIZATION_DATA = {
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
}

export const AuthorizedPublishWizardThirdPartyCollectionModal = withAuthorizedAction(
  PublishWizardCollectionModal,
  AuthorizedAction.PUBLISH_COLLECTION,
  AUTHORIZATION_DATA,
  getThirdPartyPublishStatus,
  getError
)

export const AuthorizedPublishWizardCollectionModal = withAuthorizedAction(
  PublishWizardCollectionModal,
  AuthorizedAction.PUBLISH_COLLECTION,
  AUTHORIZATION_DATA,
  getPublishStatus,
  getError
)
