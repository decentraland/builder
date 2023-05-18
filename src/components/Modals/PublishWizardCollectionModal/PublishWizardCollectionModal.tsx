import React, { useEffect, useState } from 'react'
import { buildManaAuthorization } from 'lib/mana'
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
import { getPublishStatus, getError } from 'modules/collection/selectors'
import { Props, PublishWizardCollectionSteps } from './PublishWizardCollectionModal.types'
import ConfirmCollectionNameStep from './ConfirmCollectionNameStep/ConfirmCollectionNameStep'
import ConfirmCollectionItemsStep from './ConfirmCollectionItemsStep/ConfirmCollectionItemsStep'
import ReviewContentPolicyStep from './ReviewContentPolicyStep/ReviewContentPolicyStep'
import PayPublicationFeeStep from './PayPublicationFeeStep/PayPublicationFeeStep'
import CongratulationsStep from './CongratulationsStep/CongratulationsStep'
import './PublishWizardCollectionModal.css'

export const PublishWizardCollectionModal: React.FC<Props> = props => {
  const { collection, items, wallet, rarities, onClose, onFetchRarities, onPublish, onAuthorizedAction } = props
  const [currentStep, setCurrentStep] = useState<number>(PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME)
  const [collectionName, setCollectionName] = useState<string>('')
  const [emailAddress, setEmailAddress] = useState<string>('')
  const [contentPolicyFirstConditionChecked, setContentPolicyFirstConditionChecked] = useState<boolean>(false)
  const [acceptTermsOfUseChecked, setAcceptTermsOfUseChecked] = useState<boolean>(false)
  const [ackowledgeDaoTermsChecked, setAckowledgeDaoTermsChecked] = useState<boolean>(false)

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
  }

  const handleOnChangeEmailAddress = (email: string) => {
    setEmailAddress(email)
  }

  const handleOnContentPolicyFirstConditionChange = (value: boolean) => {
    setContentPolicyFirstConditionChecked(value)
  }

  const handleOnAcceptTermsOfUseChange = (value: boolean) => {
    setAcceptTermsOfUseChecked(value)
  }

  const handleOnAckowledgeDaoTermsChange = (value: boolean) => {
    setAckowledgeDaoTermsChecked(value)
  }

  const handleOnPublish = () => {
    const authorization = buildManaAuthorization(wallet.address, wallet.networks.MATIC.chainId, ContractName.CollectionManager)
    const manaContract = {
      name: authorization.contractName,
      address: authorization.contractAddress,
      chainId: authorization.chainId,
      network: Network.MATIC,
      category: NFTCategory.ENS
    }

    onAuthorizedAction({
      authorizedAddress: authorization.authorizedAddress,
      authorizedContractLabel: ContractName.CollectionManager,
      targetContract: manaContract,
      targetContractName: ContractName.MANAToken,
      requiredAllowanceInWei: ethers.BigNumber.from(rarities[0].prices!.MANA).mul(items.length).toString(),
      authorizationType: AuthorizationType.ALLOWANCE,
      onAuthorized: () => onPublish(collection, items, emailAddress)
    })
  }

  const renderStepView = () => {
    switch (currentStep) {
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_NAME:
        return (
          <ConfirmCollectionNameStep
            collection={collection}
            confirmedCollectionName={collectionName}
            onChangeCollectionName={handleOnConfirmCollectionName}
            onNextStep={handleOnNextStep}
          />
        )
      case PublishWizardCollectionSteps.CONFIRM_COLLECTION_ITEMS:
        return <ConfirmCollectionItemsStep items={items} onNextStep={handleOnNextStep} onPrevStep={handleOnPrevStep} />
      case PublishWizardCollectionSteps.REVIEW_CONTENT_POLICY:
        return (
          <ReviewContentPolicyStep
            collection={collection}
            confirmedEmailAddress={emailAddress}
            contentPolicyFirstConditionChecked={contentPolicyFirstConditionChecked}
            acceptTermsOfUseChecked={acceptTermsOfUseChecked}
            ackowledgeDaoTermsChecked={ackowledgeDaoTermsChecked}
            onChangeEmailAddress={handleOnChangeEmailAddress}
            onContentPolicyFirstConditionChange={handleOnContentPolicyFirstConditionChange}
            onAcceptTermsOfUseChange={handleOnAcceptTermsOfUseChange}
            onAckowledgeDaoTermsChange={handleOnAckowledgeDaoTermsChange}
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

export default withAuthorizedAction(PublishWizardCollectionModal, AuthorizedAction.PUBLISH_COLLECTION, getPublishStatus, getError)
