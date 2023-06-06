import * as React from 'react'
import classNames from 'classnames'
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
    showPopup: false,
    timeOut: 3000
  }

  state: State = {
    hasCopiedText: false,
    fadeOut: false
  }

  handleTransitionEnd = () => {
    if (this.props.showPopup) {
      this.setState({ hasCopiedText: false, fadeOut: false })
    }
  }

  handleCopy = async () => {
    const { showPopup, text, timeOut, onCopy } = this.props
    await copyText(text, () => {
      if (onCopy) {
        onCopy()
      }

      if (showPopup) {
        this.setState({ hasCopiedText: true })
        setTimeout(() => {
          this.setState({ fadeOut: true })
        }, timeOut)
      }
    })
  }

  render() {
    const { className, children, role, showPopup } = this.props
    const { fadeOut, hasCopiedText } = this.state
    return (
      <div className={classNames(className)} role={role} aria-label="copy" onClick={this.handleCopy}>
        {showPopup ? (
          <Popup
            className={classNames('copy-to-clipboard-popup', { 'fade-out': fadeOut })}
            onTransitionEnd={this.handleTransitionEnd}
            content={<div className="copied-text">{t('global.copied')}</div>}
            position="right center"
            trigger={children}
            open={hasCopiedText}
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
