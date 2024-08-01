import React, { useCallback, useMemo, useState } from 'react'
import { ModalNavigation, Button, Checkbox, Field, CheckboxProps, InputOnChangeData } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { emailRegex } from 'lib/validators'
import { getItemsToPublish, getItemsWithChanges } from 'modules/item/utils'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import { Props } from './ReviewConditionsStep.types'
import styles from './ReviewConditionsStep.module.css'

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

export const ReviewConditionsStep = (props: Props) => {
  const { items, itemsStatus, itemCurations, thirdParty, onPublish, onClose, onPushChanges, onPublishAndPushChanges, action } = props

  const slotsToUse = useMemo(() => {
    const itemsToPublishLength = getItemsToPublish(items, itemsStatus).length
    const itemsToPushChangesLength = getItemsWithChanges(items, itemsStatus, itemCurations).length
    const isPublishingAndPushingChanges = itemsToPushChangesLength > 0 && itemsToPublishLength > 0
    const isJustPushingChanges = itemsToPushChangesLength > 0 && !itemsToPublishLength

    if (isPublishingAndPushingChanges) {
      return itemsToPublishLength
    } else if (isJustPushingChanges) {
      return itemsToPushChangesLength
    }
    return items.length
  }, [items, itemsStatus, itemCurations])

  const confirmButtonLabel = useMemo(() => {
    switch (action) {
      case PublishButtonAction.PUSH_CHANGES:
        return t('publish_third_party_collection_modal.review_conditions_step.confirm.push_changes')
      case PublishButtonAction.PUBLISH_AND_PUSH_CHANGES:
        return t('publish_third_party_collection_modal.review_conditions_step.confirm.publish_and_push_changes')
      default:
        return t('publish_third_party_collection_modal.review_conditions_step.confirm.publish')
    }
  }, [action])

  const conditions = useMemo(
    () => [
      t('publish_third_party_collection_modal.review_conditions_step.review_content_policy.first', {
        terms_of_use_link: termsOfUseLink,
        content_policy_link: contentPolicyLink
      }),
      t('publish_third_party_collection_modal.review_conditions_step.review_content_policy.second'),
      t('publish_third_party_collection_modal.review_conditions_step.review_content_policy.third', {
        terms_of_use_link: termsOfUseLink,
        content_policy_link: contentPolicyLink
      }),
      ...(action !== PublishButtonAction.PUSH_CHANGES
        ? [t('publish_third_party_collection_modal.review_conditions_step.review_content_policy.fourth', { slotsToUse })]
        : [])
    ],
    [t, action, slotsToUse]
  )

  const [conditionsChecked, setConditionsCheck] = useState<boolean[]>(Array.from({ length: conditions.length }, () => false))
  const [emailAddressFocus, setEmailAddressFocus] = useState<boolean>(false)
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState<boolean>(false)
  const [emailAddress, setEmailAddress] = useState<string>()

  const handleOnEmailAddressChange = useCallback((_, { value }: InputOnChangeData) => {
    setEmailAddress(value)
  }, [])
  const handleOnEmailAddressFocus = useCallback(() => {
    setEmailAddressFocus(true)
  }, [])
  const handleOnEmailAddressBlur = useCallback(() => {
    setEmailAddressFocus(false)
  }, [])
  const handleOnAcceptSubscriptionNewsletter = useCallback((_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
    setSubscribeToNewsletter(!!checked)
  }, [])
  const handleConditionCheck = useCallback(
    (index: number) => {
      setConditionsCheck(prev => prev.map((value, i) => (i === index ? !value : value)))
    },
    [conditionsChecked, setConditionsCheck]
  )
  const allConditionsChecked = useMemo(() => conditionsChecked.every(Boolean), [conditionsChecked])
  const hasValidEmail = emailAddress && emailRegex.test(emailAddress)
  const showEmailError = !hasValidEmail && !emailAddressFocus && !!emailAddress
  const disabled = !allConditionsChecked || !hasValidEmail

  const handleSubmit = useCallback(() => {
    if (!thirdParty) return

    switch (action) {
      case PublishButtonAction.PUSH_CHANGES:
        onPushChanges(items)
        break
      case PublishButtonAction.PUBLISH_AND_PUSH_CHANGES:
        onPublishAndPushChanges(thirdParty, getItemsToPublish(items, itemsStatus), getItemsWithChanges(items, itemsStatus, itemCurations))
        break
      default:
        if (emailAddress) {
          onPublish(thirdParty, items, emailAddress, subscribeToNewsletter)
        }
        break
    }
  }, [
    thirdParty,
    action,
    items,
    itemsStatus,
    itemCurations,
    emailAddress,
    subscribeToNewsletter,
    onPublish,
    onPushChanges,
    onPublishAndPushChanges
  ])

  return (
    <>
      <ModalNavigation
        title={t('publish_third_party_collection_modal.review_conditions_step.title')}
        subtitle={t('publish_third_party_collection_modal.review_conditions_step.subtitle')}
        onClose={onClose}
      />
      <Modal.Content className={styles.content}>
        <div>
          {conditions.map((condition, index) => (
            <div className={styles.checkboxContainer} key={index}>
              <Checkbox checked={conditionsChecked[index]} onChange={() => handleConditionCheck(index)} />
              <span>{condition}</span>
            </div>
          ))}
        </div>
        <div>
          <h3>{t('publish_third_party_collection_modal.review_conditions_step.subscription.title')}</h3>
          <p className={styles.subscriptionText}>{t('publish_third_party_collection_modal.review_conditions_step.subscription.text')}</p>
          <Field
            label={t('global.email')}
            type="email"
            value={emailAddress}
            onChange={handleOnEmailAddressChange}
            onFocus={handleOnEmailAddressFocus}
            onBlur={handleOnEmailAddressBlur}
            error={showEmailError}
            message={showEmailError ? t('publish_collection_modal_with_oracle.invalid_email') : undefined}
          />
          {action === PublishButtonAction.PUBLISH && (
            <div className={styles.checkboxContainer}>
              <Checkbox checked={subscribeToNewsletter} onChange={handleOnAcceptSubscriptionNewsletter} />
              <span>{t('publish_third_party_collection_modal.review_conditions_step.subscription.checkbox_text')}</span>
            </div>
          )}
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button secondary onClick={onClose}>
          {t('global.cancel')}
        </Button>
        <Button disabled={disabled} primary onClick={handleSubmit}>
          {confirmButtonLabel}
        </Button>
      </Modal.Actions>
    </>
  )
}
