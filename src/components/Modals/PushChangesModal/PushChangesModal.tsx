import { useCallback, useMemo, useState } from 'react'
import { Button, Message, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ReviewContentPolicyStep } from '../PublishWizardCollectionModal/ReviewContentPolicyStep'
import styles from './PushChangesModal.module.css'
import { Props } from './PushChangesModal.types'
import {
  PUSH_CHANGES_MODAL_CANCEL_CHANGES_DATA_TEST_ID,
  PUSH_CHANGES_MODAL_CONFIRM_CHANGES_DATA_TEST_ID,
  PUSH_CHANGES_MODAL_FIRST_STEP_DATA_TEST_ID
} from './constants'

enum Steps {
  CONFIRM_CHANGES = 'CONFIRM_CHANGES',
  ACCEPT_TERMS = 'ACCEPT_TERMS'
}

export const PushChangesModal = (props: Props) => {
  const { onClose, onPushChanges, isLoading, error, collection } = props

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.CONFIRM_CHANGES)
  const [email, setEmail] = useState<string>('')
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState<boolean>(false)

  const stepTitle = useMemo(() => {
    switch (currentStep) {
      case Steps.CONFIRM_CHANGES:
        return t('push_changes_modal.title')
      case Steps.ACCEPT_TERMS:
        return t('publish_wizard_collection_modal.title_review_content_policy')
    }
  }, [currentStep])

  const handleProceedFromConfirmChanges = useCallback(() => {
    setCurrentStep(Steps.ACCEPT_TERMS)
  }, [])

  const handleGoBack = useCallback(() => {
    setCurrentStep(Steps.CONFIRM_CHANGES)
  }, [])

  const handleOnPushChanges = useCallback(() => {
    onPushChanges(email, subscribeToNewsletter)
  }, [onPushChanges, email, subscribeToNewsletter])

  return (
    <Modal className={styles.main} size="small" onClose={isLoading ? undefined : onClose} closeOnDimmerClick={false}>
      <ModalNavigation title={stepTitle} onClose={isLoading ? undefined : onClose} />
      {currentStep === Steps.CONFIRM_CHANGES ? (
        <Modal.Content>
          <div className={styles.content} data-testid={PUSH_CHANGES_MODAL_FIRST_STEP_DATA_TEST_ID}>
            <T
              id="push_changes_modal.description"
              values={{
                br: (
                  <>
                    <br />
                    <br />
                  </>
                )
              }}
            />
          </div>

          <div className={styles.actions}>
            <Button data-testid={PUSH_CHANGES_MODAL_CANCEL_CHANGES_DATA_TEST_ID} secondary onClick={onClose}>
              {t('global.cancel')}
            </Button>
            <Button data-testid={PUSH_CHANGES_MODAL_CONFIRM_CHANGES_DATA_TEST_ID} primary onClick={handleProceedFromConfirmChanges}>
              {t('global.proceed')}
            </Button>
          </div>
        </Modal.Content>
      ) : (
        <ReviewContentPolicyStep
          collection={collection}
          confirmedEmailAddress={email}
          subscribeToNewsletter={subscribeToNewsletter}
          onChangeEmailAddress={setEmail}
          onSubscribeToNewsletter={setSubscribeToNewsletter}
          onNextStep={handleOnPushChanges}
          onPrevStep={handleGoBack}
        />
      )}
      {error ? (
        <Message className={styles.error} error>
          {error}
        </Message>
      ) : null}
    </Modal>
  )
}
