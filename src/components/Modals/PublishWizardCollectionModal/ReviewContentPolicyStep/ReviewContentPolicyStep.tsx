import React, { useCallback, useMemo, useState } from 'react'
import { Button, Checkbox, CheckboxProps, Field, InputOnChangeData, Modal, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isTPCollection } from 'modules/collection/utils'
import { emailRegex } from 'lib/validators'
import { Props } from './ReviewContentPolicyStep.types'
import styles from './ReviewContentPolicyStep.module.css'

const termsOfUseLink = (link: string) => (
  <a href="https://decentraland.org/terms/" rel="noopener noreferrer" target="_blank">
    {link}
  </a>
)

const contentPolicyLink = (link: string) => (
  <a href="https://decentraland.org/content/" rel="noopener noreferrer" target="_blank">
    {link}
  </a>
)

export const ReviewContentPolicyStep: React.FC<Props> = props => {
  const {
    collection,
    confirmedEmailAddress,
    subscribeToNewsletter,
    onChangeEmailAddress,
    onSubscribeToNewsletter,
    onNextStep,
    onPrevStep
  } = props
  const [emailAddressFocus, setEmailAddressFocus] = useState<boolean>(false)
  const isThirdParty = useMemo(() => isTPCollection(collection), [collection])
  const conditions = useMemo(
    () =>
      isThirdParty
        ? [
            t('publish_wizard_collection_modal.review_content_policy_step.third_parties.first', {
              terms_of_use_link: termsOfUseLink,
              content_policy_link: contentPolicyLink
            }),
            t('publish_wizard_collection_modal.review_content_policy_step.third_parties.second'),
            t('publish_wizard_collection_modal.review_content_policy_step.third_parties.third', {
              terms_of_use_link: termsOfUseLink,
              content_policy_link: contentPolicyLink
            })
          ]
        : [
            t('publish_wizard_collection_modal.review_content_policy_step.standard.content_policy_first_condition', {
              collection_name: <b>{collection.name}</b>
            }),
            t('publish_wizard_collection_modal.review_content_policy_step.standard.accept_terms_of_use', {
              terms_of_use_link: termsOfUseLink,
              content_policy_link: contentPolicyLink
            }),
            t('publish_wizard_collection_modal.review_content_policy_step.standard.acknowledge_immutability'),
            t('publish_wizard_collection_modal.review_content_policy_step.standard.acknowledge_dao_terms', {
              terms_of_use_link: termsOfUseLink,
              content_policy_link: contentPolicyLink
            })
          ],
    [t, isThirdParty, collection.name]
  )
  const [conditionsChecked, setConditionsCheck] = useState<boolean[]>(Array.from({ length: conditions.length }, () => false))

  const handleConditionCheck = useCallback(
    (index: number) => {
      setConditionsCheck(prev => prev.map((value, i) => (i === index ? !value : value)))
    },
    [conditionsChecked, setConditionsCheck]
  )

  const handleOnEmailAddressChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
      onChangeEmailAddress(value)
    },
    [onChangeEmailAddress]
  )

  const handleOnEmailAddressFocus = useCallback(() => {
    setEmailAddressFocus(true)
  }, [])

  const handleOnEmailAddressBlur = useCallback(() => {
    setEmailAddressFocus(false)
  }, [])

  const handleOnAcceptSubscriptionNewsletter = useCallback(
    (_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
      onSubscribeToNewsletter(!!checked)
    },
    [onSubscribeToNewsletter]
  )

  const allConditionsChecked = useMemo(() => conditionsChecked.every(Boolean), [conditionsChecked])
  const hasValidEmail = emailRegex.test(confirmedEmailAddress)
  const showEmailError = !hasValidEmail && !emailAddressFocus && !!confirmedEmailAddress

  const isDisabled = !hasValidEmail || !allConditionsChecked

  return (
    <>
      <Modal.Content className="ReviewContentPolicyStep">
        <div className={styles.content}>
          <p className={styles.title}>{t('publish_wizard_collection_modal.review_content_policy_step.title')}</p>
          <p className={styles.subtitle}>{t('publish_wizard_collection_modal.review_content_policy_step.subtitle')}</p>
          <div>
            {conditions.map((condition, index) => (
              <div className={styles.checkboxContainer} key={index}>
                <Checkbox checked={conditionsChecked[index]} onChange={() => handleConditionCheck(index)} />
                <span>{condition}</span>
              </div>
            ))}
          </div>
          <div>
            <h3>{t('publish_wizard_collection_modal.review_content_policy_step.subscription.title')}</h3>
            <p className={styles.subscriptionText}>{t('publish_wizard_collection_modal.review_content_policy_step.subscription.text')}</p>
            <Field
              label={t('global.email')}
              type="email"
              value={confirmedEmailAddress}
              onChange={handleOnEmailAddressChange}
              onFocus={handleOnEmailAddressFocus}
              onBlur={handleOnEmailAddressBlur}
              error={showEmailError}
              message={showEmailError ? t('publish_collection_modal_with_oracle.invalid_email') : undefined}
            />
            <div className={styles.checkboxContainer}>
              <Checkbox checked={subscribeToNewsletter} onChange={handleOnAcceptSubscriptionNewsletter} />
              <span>{t('publish_wizard_collection_modal.review_content_policy_step.subscription.checkbox_text')}</span>
            </div>
          </div>
        </div>
        <Row className={styles.actions}>
          <Button secondary onClick={onPrevStep}>
            {t('global.back')}
          </Button>
          <Button primary onClick={onNextStep} disabled={isDisabled}>
            {t('publish_wizard_collection_modal.review_content_policy_step.continue')}
          </Button>
        </Row>
      </Modal.Content>
    </>
  )
}

export default ReviewContentPolicyStep
