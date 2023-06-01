import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import copyText from 'lib/copyText'

type Props = {
  text: string
  children: React.ReactNode
  role: 'button' | 'option'
  showPopup?: boolean
  className?: string
  timeOut?: number
  onCopy?: () => void
}

type State = {
  hasCopiedText: boolean
  fadeOut: boolean
}

export default class CopyToClipboard extends React.PureComponent<Props, State> {
  static defaultProps = {
    timeOut: 3000
  }

  state: State = {
    hasCopiedText: false,
    fadeOut: false
  }

  componentDidUpdate(_prevProps: Props, prevState: State): void {
    if (this.props.showPopup && prevState.hasCopiedText === false && this.state.hasCopiedText === true) {
      setTimeout(() => {
        this.setState(prevState => ({ ...prevState, fadeOut: true }))
      }, this.props.timeOut)
    }
  }

  handleTransitionEnd = () => {
    if (this.props.showPopup) {
      this.setState(prevState => ({ ...prevState, hasCopiedText: false }))
    }
  }

  handleCopy = async () => {
    const { text } = this.props
    await copyText(text, () => {
      this.props?.onCopy && this.props.onCopy()
      if (this.props.showPopup) {
        this.setState({ hasCopiedText: true, fadeOut: false })
      }
      return
    })
  }

  render() {
    const { children } = this.props
    return (
      <div {...this.props} aria-label="copy" onClick={this.handleCopy}>
        {this.props.showPopup ? (
          <Popup
            className={`copy-to-clipboard-popup ${this.state.fadeOut ? 'fade-out' : ''}`}
            onTransitionEnd={this.handleTransitionEnd}
            content={<div className="copied-text">{t('global.copied')}</div>}
            position="right center"
            trigger={children}
            open={this.state.hasCopiedText}
            inverted
            basic
          />
        ) : (
          children
        )}
      </div>
    )
  }
}
