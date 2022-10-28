import React, { useCallback, useState } from 'react'
import { Button, Checkbox, CheckboxProps, Column, Field, InputOnChangeData, Modal, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { emailRegex } from 'lib/validators'
import { Collection } from 'modules/collection/types'
import './ReviewContentPolicyStep.css'

export const ReviewContentPolicyStep: React.FC<{ collection: Collection; onNextStep: (value: string) => void }> = props => {
  const { collection, onNextStep } = props
  const [emailAddress, setEmailAddress] = useState<string>('')
  const [emailAddressFocus, setEmailAddressFocus] = useState<boolean>(false)
  const [contentPolicyFirstConditionChecked, setContentPolicyFirstConditionChecked] = useState<boolean>(false)
  const [contentPolicySecondConditionChecked, setContentPolicySecondConditionChecked] = useState<boolean>(false)
  const [acceptTermsOfUseChecked, setAcceptTermsOfUseChecked] = useState<boolean>(false)
  const [ackowledgeDaoTermsChecked, setAckowledgeDaoTermsChecked] = useState<boolean>(false)

  const handleOnEmailAddressChange = useCallback((_: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    setEmailAddress(value)
  }, [])

  const handleOnEmailAddressFocus = useCallback(() => {
    setEmailAddressFocus(true)
  }, [])

  const handleOnEmailAddressBlur = useCallback(() => {
    setEmailAddressFocus(false)
  }, [])

  const handleOnContentPolicyFirstConditionChecked = useCallback((_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
    setContentPolicyFirstConditionChecked(!!checked)
  }, [])

  const handleOnContentPolicySecondConditionChecked = useCallback((_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
    setContentPolicySecondConditionChecked(!!checked)
  }, [])

  const handleOnAcceptTermsOfUseChecked = useCallback((_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
    setAcceptTermsOfUseChecked(!!checked)
  }, [])

  const handleOnAckowledgeDaoTermsChecked = useCallback((_: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
    setAckowledgeDaoTermsChecked(!!checked)
  }, [])

  const hasValidEmail = emailRegex.test(emailAddress)
  const showEmailError = !hasValidEmail && !emailAddressFocus && emailAddress !== undefined && emailAddress !== ''

  const isDisabled =
    !hasValidEmail ||
    !contentPolicyFirstConditionChecked ||
    !contentPolicySecondConditionChecked ||
    !acceptTermsOfUseChecked ||
    !ackowledgeDaoTermsChecked

  return (
    <>
      <Modal.Content className="ReviewContentPolicyStep">
        <Column>
          <Row className="details">
            <Column grow={true}>
              <p className="title">{t('publish_wizard_collection_modal.review_content_policy_step.title')}</p>
              <div className="content-policies-conditions">
                <div className="checkbox-container">
                  <Checkbox checked={contentPolicyFirstConditionChecked} onChange={handleOnContentPolicyFirstConditionChecked} />
                  <span>
                    {t('publish_wizard_collection_modal.review_content_policy_step.content_policy_first_condition', {
                      collection_name: <b>{collection!.name}</b>
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
                  <Checkbox checked={contentPolicySecondConditionChecked} onChange={handleOnContentPolicySecondConditionChecked} />
                  <span>{t('publish_wizard_collection_modal.review_content_policy_step.content_policy_second_condition')}</span>
                </div>
                <div className="checkbox-container">
                  <Checkbox checked={ackowledgeDaoTermsChecked} onChange={handleOnAckowledgeDaoTermsChecked} />
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
              <p className="subtitle">
                {t('publish_wizard_collection_modal.review_content_policy_step.email_disclousure_detail', {
                  enter: <br />
                })}
              </p>
              <Field
                label={t('global.email')}
                value={emailAddress}
                onChange={handleOnEmailAddressChange}
                onFocus={handleOnEmailAddressFocus}
                onBlur={handleOnEmailAddressBlur}
                error={showEmailError}
                message={showEmailError ? t('publish_collection_modal_with_oracle.invalid_email') : undefined}
              />
            </Column>
          </Row>
          <Row className="actions" align="right">
            <Button className="proceed" primary onClick={() => onNextStep(emailAddress)} disabled={isDisabled}>
              {t('publish_wizard_collection_modal.review_content_policy_step.continue')}
            </Button>
          </Row>
        </Column>
      </Modal.Content>
    </>
  )
}

export default ReviewContentPolicyStep
