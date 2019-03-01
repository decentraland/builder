import * as React from 'react'
import { Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props, State } from './TutorialModal.types'
import './TutorialModal.css'

const localStorage = getLocalStorage()

export default class TutorialModal extends React.PureComponent<Props, State> {
  state = {
    step: 0
  }

  slides = [
    {
      thumbnail: 'slide0',
      text: t('tutorial_modal.slide0')
    },
    {
      thumbnail: 'slide1',
      text: t('tutorial_modal.slide1')
    },
    {
      thumbnail: 'slide2',
      text: t('tutorial_modal.slide2')
    },
    {
      thumbnail: 'slide3',
      text: t('tutorial_modal.slide3')
    }
  ]

  renderSteps = () => {
    const { step } = this.state
    let out: JSX.Element[] = []

    for (let i = 0; i < this.slides.length; i++) {
      out.push(<div className={'step ' + (i === step ? 'active' : '')} onClick={() => this.goToSlide(i)} />)
    }

    return out
  }

  renderSlide = () => {
    const { step } = this.state
    const slide = this.slides[step]

    return (
      <div className={'slide ' + slide.thumbnail}>
        <span className="description">{slide.text}</span>
      </div>
    )
  }

  goToSlide = (index: number) => {
    if (index === this.slides.length) {
      localStorage.setItem('builder-tutorial', '1')
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
          <div className="title">{t('tutorial_modal.title')}</div>
          <div className="subtitle">{t('tutorial_modal.subtitle')}</div>
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
