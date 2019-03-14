import * as React from 'react'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Button, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { LOCALSTORAGE_TUTORIAL_KEY } from 'components/EditorPage/EditorPage'
import { api, EMAIL_INTEREST } from 'lib/api'

import { Props, State } from './TutorialModal.types'
import './TutorialModal.css'

const localStorage = getLocalStorage()
export const LOCALSTORAGE_TUTORIAL_EMAIL_KEY = 'builder-tutorial-email'

export default class TutorialModal extends React.PureComponent<Props, State> {
  state = {
    step: 0,
    isLoading: false,
    email: ''
  }

  slides = new Array(6).fill(0).map((_, index) => ({
    thumbnail: `slide${index}`, // the last thumbnail won't exist
    title: t(`tutorial_modal.slide${index}.title`),
    description: <T id={`tutorial_modal.slide${index}.description`} values={{ br: <br /> }} />
  }))

  handleSubmitEmail = async () => {
    const { email } = this.state
    const analytics = getAnalytics()

    this.props.onSetEmail(email)

    this.setState({ isLoading: true })

    analytics.identify({ email }, () => {
      localStorage.setItem(LOCALSTORAGE_TUTORIAL_EMAIL_KEY, email)
    })

    api.reportEmail(email, EMAIL_INTEREST.CONTEST).catch(() => console.error('Unable to submit email, something went wrong!'))

    this.setState({ isLoading: false })
  }

  handleEmailChange = (event: React.FormEvent<HTMLInputElement>) => {
    const email = event.currentTarget.value
    this.setState({ email })
  }

  renderForm = () => {
    const { email, isLoading } = this.state
    const existingEmail = this.props.email

    return (
      <div className="form">
        <div className="banner">
          <T
            id="tutorial_modal.contest"
            values={{
              mana: <span className="highlight">{t('contest.mana')}</span>,
              land: <span className="highlight">{t('contest.land')}</span>
            }}
          />
        </div>
        <div className="form-container">
          <Field
            type="email"
            label={t('global.email')}
            placeholder="you@your-email.com"
            value={existingEmail || email}
            onChange={this.handleEmailChange}
            disabled={isLoading || !!existingEmail}
            action={!existingEmail ? t('global.sign_up') : null}
            onAction={this.handleSubmitEmail}
            message={existingEmail ? t('tutorial_modal.email_thanks') : t('tutorial_modal.email_disclaimer')}
          />
        </div>
      </div>
    )
  }

  renderSteps = () => {
    const { step } = this.state
    let out: JSX.Element[] = []

    for (let i = 0; i < this.slides.length; i++) {
      out.push(<div key={`step-${i}`} className={'step ' + (i === step ? 'active' : '')} onClick={() => this.goToSlide(i)} />)
    }

    return out
  }

  renderSlide = () => {
    const { step } = this.state
    const slide = this.slides[step]

    return (
      <>
        <div className="title">{slide.title}</div>
        <div className="subtitle">{slide.description}</div>
        {step !== this.slides.length - 1 ? <div key={`slide-${step}`} className={'slide ' + slide.thumbnail} /> : this.renderForm()}
      </>
    )
  }

  goToSlide = (index: number) => {
    if (index === this.slides.length) {
      localStorage.setItem(LOCALSTORAGE_TUTORIAL_KEY, '1')
      if (this.state.email && !this.props.email) {
        this.handleSubmitEmail().catch(() => console.error('Unable to submit email, something went wrong!'))
      }
      this.props.onClose()
      return
    }
    this.setState({ step: index })
  }

  handleNextStep = () => {
    const nextStep = this.state.step + 1
    this.goToSlide(nextStep)
  }

  handlePreviousStep = () => {
    const previousStep = this.state.step - 1
    this.setState({ step: previousStep })
  }

  handleClose = () => {
    /* noop */
  }

  render() {
    const { name } = this.props
    const { step } = this.state

    return (
      <Modal name={name} onClose={this.handleClose}>
        <Modal.Content>
          {this.renderSlide()}
          <div className="actions">
            {step !== 0 ? (
              <Button onClick={this.handlePreviousStep} secondary>
                {t('global.back')}
              </Button>
            ) : (
              <div className="spacer" />
            )}
            <div className="steps">{this.renderSteps()}</div>
            <Button primary onClick={this.handleNextStep}>
              {step === this.slides.length - 1 ? t('global.done') : t('global.next')}
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}
