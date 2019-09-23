import * as React from 'react'
import { env } from 'decentraland-commons'
import { Button, Close } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { LOCALSTORAGE_TUTORIAL_KEY } from 'components/EditorPage/EditorPage'
import { preventDefault } from 'lib/preventDefault'
import { getSlides } from './slides'
import { Props, State } from './TutorialModal.types'
import './TutorialModal.css'

const PUBLIC_URL = env.get('PUBLIC_URL')
const localStorage = getLocalStorage()

// Segment Events
const TUTORIAL_STEP_EVENT = 'Tutorial Step'
const TUTORIAL_SKIP_EVENT = 'Tutorial Skip'
const TUTORIAL_COMPLETE = 'Tutorial Complete'

export const LOCALSTORAGE_TUTORIAL_EMAIL_KEY = 'builder-tutorial-email'

export default class TutorialModal extends React.PureComponent<Props, State> {
  state = {
    step: 0
  }

  slides = getSlides()

  preventVideoContextMenu = preventDefault()

  analytics = getAnalytics()

  componentWillMount = () => {
    this.analytics.track(TUTORIAL_STEP_EVENT, { step: 0 })
  }

  handleSkip = () => {
    this.analytics.track(TUTORIAL_SKIP_EVENT)
    localStorage.setItem(LOCALSTORAGE_TUTORIAL_KEY, '1')
    this.props.onClose()
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
        <Modal.Header>{slide.title}</Modal.Header>
        <Modal.Description>{slide.description}</Modal.Description>
        <Modal.Content>
          <div key={`slide-${step}`} className="slide" onContextMenu={this.preventVideoContextMenu}>
            <video src={`${PUBLIC_URL}/videos/${slide.thumbnail}.mp4`} autoPlay muted loop />
          </div>
        </Modal.Content>
      </>
    )
  }

  goToSlide = (index: number) => {
    if (index === this.slides.length) {
      localStorage.setItem(LOCALSTORAGE_TUTORIAL_KEY, '1')
      this.props.onClose()
      this.analytics.track(TUTORIAL_COMPLETE, { suscribed: false })
      return
    }
    this.setState({ step: index })

    this.analytics.track(TUTORIAL_STEP_EVENT, { step: index })
  }

  handleNextStep = () => {
    const nextStep = this.state.step + 1
    this.goToSlide(nextStep)
  }

  handlePreviousStep = () => {
    const previousStep = this.state.step - 1
    this.goToSlide(previousStep)
  }

  render() {
    const { name } = this.props
    const { step } = this.state

    return (
      <Modal name={name} onClose={this.handleSkip} closeIcon={<Close onClick={this.handleSkip} />}>
        {this.renderSlide()}
        <Modal.Actions>
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
        </Modal.Actions>
      </Modal>
    )
  }
}
