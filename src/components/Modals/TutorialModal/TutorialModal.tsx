import * as React from 'react'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Button, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props, State } from './TutorialModal.types'
import './TutorialModal.css'
import { reportEmail } from 'modules/analytics/helpers'

const localStorage = getLocalStorage()

export default class TutorialModal extends React.PureComponent<Props, State> {
  state = {
    step: 0,
    isLoading: false,
    email: ''
  }

  slides = [
    {
      thumbnail: 'slide0',
      title: t('tutorial_modal.slide0.title'),
      description: <T id="tutorial_modal.slide0.description" values={{ br: <br /> }} />
    },
    {
      thumbnail: 'slide1',
      title: t('tutorial_modal.slide1.title'),
      description: <T id="tutorial_modal.slide1.description" values={{ br: <br /> }} />
    },
    {
      thumbnail: 'slide2',
      title: t('tutorial_modal.slide2.title'),
      description: <T id="tutorial_modal.slide2.description" values={{ br: <br /> }} />
    },
    {
      thumbnail: 'slide3',
      title: t('tutorial_modal.slide3.title'),
      description: <T id="tutorial_modal.slide3.description" values={{ br: <br /> }} />
    },
    {
      thumbnail: 'nada',
      title: t('tutorial_modal.slide4.title'),
      description: <T id="tutorial_modal.slide4.description" values={{ br: <br /> }} />
    }
  ]

  handleSubmitEmail = async () => {
    const { email } = this.state
    const analytics = getAnalytics()

    this.props.onSetEmail(email)

    this.setState({ isLoading: true })

    analytics.identify({ email }, () => {
      localStorage.setItem('tutorial-email', email)
    })

    await reportEmail(email, 'builder-app-tutorial')
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
            label="E-mail"
            placeholder="you@your-email.com"
            value={existingEmail || email}
            onChange={this.handleEmailChange}
            disabled={isLoading || !!existingEmail}
            action={t('global.sign_up')}
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
      localStorage.setItem('builder-tutorial', '1')
      if (this.state.email) {
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
