import React, { useCallback, useState } from 'react'
import { Button, Checkbox, CheckboxProps, Column, Field, InputOnChangeData, Modal, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { emailRegex } from 'lib/validators'
import { Props } from './ReviewContentPolicyStep.types'
import './ReviewContentPolicyStep.css'

export const ReviewContentPolicyStep: React.FC<Props> = props => {
  const {
    collection,
    confirmedEmailAddress,
    contentPolicyFirstConditionChecked,
    acceptTermsOfUseChecked,
    acknowledgeImmutability,
    acknowledgeDaoTermsChecked,
    subscribeToNewsletter,
    onChangeEmailAddress,
    onContentPolicyFirstConditionChange,
    onAcceptTermsOfUseChange,
    onAcknowledgeImmutability,
    onAcknowledgeDaoTermsChange,
    onSubscribeToNewsletter,
    onNextStep,
    onPrevStep
  } = props
  const [emailAddressFocus, setEmailAddressFocus] = useState<boolean>(false)

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

  const handleOnContentPolicyFirstConditionChecked = useCallback(
    (_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
      onContentPolicyFirstConditionChange(!!checked)
    },
    [onContentPolicyFirstConditionChange]
  )

  const handleOnAcceptTermsOfUseChecked = useCallback(
    (_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
      onAcceptTermsOfUseChange(!!checked)
    },
    [onAcceptTermsOfUseChange]
  )

  const handleOnAcknowledgeImmutability = useCallback(
    (_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
      onAcknowledgeImmutability(!!checked)
    },
    [onAcknowledgeImmutability]
  )

  const handleOnAcknowledgeDaoTermsChecked = useCallback(
    (_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
      onAcknowledgeDaoTermsChange(!!checked)
    },
    [onAcknowledgeDaoTermsChange]
  )

  const handleOnAcceptSubscriptionNewsletter = useCallback(
    (_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
      onSubscribeToNewsletter(!!checked)
    },
    [onSubscribeToNewsletter]
  )

  const hasValidEmail = emailRegex.test(confirmedEmailAddress)
  const showEmailError = !hasValidEmail && !emailAddressFocus && !!confirmedEmailAddress

  const isDisabled =
    !hasValidEmail ||
    !contentPolicyFirstConditionChecked ||
    !acceptTermsOfUseChecked ||
    !acknowledgeImmutability ||
    !acknowledgeDaoTermsChecked

  return (
    <>
      <Modal.Content className="ReviewContentPolicyStep">
        <Column>
          <Row className="details">
            <Column grow={true}>
              <p className="title">{t('publish_wizard_collection_modal.review_content_policy_step.title')}</p>
              <p className="subtitle">{t('publish_wizard_collection_modal.review_content_policy_step.subtitle')}</p>
              <div className="content-policies-conditions">
                <div className="checkbox-container">
                  <Checkbox checked={contentPolicyFirstConditionChecked} onChange={handleOnContentPolicyFirstConditionChecked} />
                  <span>
                    {t('publish_wizard_collection_modal.review_content_policy_step.content_policy_first_condition', {
                      collection_name: <b>{collection.name}</b>
                    })}
                  </span>
                </div>
                <div className="checkbox-container">
                  <Checkbox checked={acceptTermsOfUseChecked} onChange={handleOnAcceptTermsOfUseChecked} />
                  <span>
                    {t('publish_wizard_collection_modal.review_content_policy_step.accept_terms_of_use', {
                      terms_of_use_link: (
                        <a href="https://decentraland.org/terms/" rel="noopener noreferrer" target="_blank">
                          {t('publish_wizard_collection_modal.review_content_policy_step.terms_of_use')}
                        </a>
                      ),
                      content_policy_link: (
                        <a href="https://decentraland.org/content/" rel="noopener noreferrer" target="_blank">
                          {t('publish_wizard_collection_modal.review_content_policy_step.content_policy')}
                        </a>
                      )
                    })}
                  </span>
                </div>
                <div className="checkbox-container">
                  <Checkbox checked={acknowledgeImmutability} onChange={handleOnAcknowledgeImmutability} />
                  <span>{t('publish_wizard_collection_modal.review_content_policy_step.acknowledge_immutability')}</span>
                </div>
                <div className="checkbox-container">
                  <Checkbox checked={acknowledgeDaoTermsChecked} onChange={handleOnAcknowledgeDaoTermsChecked} />
                  <span>
                    {t('publish_wizard_collection_modal.review_content_policy_step.acknowledge_dao_terms', {
                      terms_of_use_link: (
                        <a href="https://decentraland.org/terms/" rel="noopener noreferrer" target="_blank">
                          {t('publish_wizard_collection_modal.review_content_policy_step.terms_of_use')}
                        </a>
                      ),
                      content_policy_link: (
                        <a href="https://decentraland.org/content/" rel="noopener noreferrer" target="_blank">
                          {t('publish_wizard_collection_modal.review_content_policy_step.content_policy')}
                        </a>
                      )
                    })}
                  </span>
                </div>
              </div>
              <p className="description">{t('publish_wizard_collection_modal.review_content_policy_step.email_disclousure')}</p>
              <p className="email-disclosure">
                {t('publish_wizard_collection_modal.review_content_policy_step.email_disclousure_detail', {
                  enter: <br />
                })}
              </p>
              <Field
                label={t('global.email')}
                value={confirmedEmailAddress}
                onChange={handleOnEmailAddressChange}
                onFocus={handleOnEmailAddressFocus}
                onBlur={handleOnEmailAddressBlur}
                error={showEmailError}
                message={showEmailError ? t('publish_collection_modal_with_oracle.invalid_email') : undefined}
              />
              <div className="content-policies-conditions">
                <div className="checkbox-container checkbox-newsletter">
                  <Checkbox checked={subscribeToNewsletter} onChange={handleOnAcceptSubscriptionNewsletter} />
                  <span>{t('publish_wizard_collection_modal.review_content_policy_step.email_newsletter')}</span>
                </div>
              </div>
            </Column>
          </Row>
          <Row className="actions">
            <Button className="back" secondary onClick={onPrevStep}>
              {t('global.back')}
            </Button>
            <Button className="proceed" primary onClick={onNextStep} disabled={isDisabled}>
              {t('publish_wizard_collection_modal.review_content_policy_step.continue')}
            </Button>
          </Row>
        </Column>
      </Modal.Content>
    </>
  )
}

export default ReviewContentPolicyStep
