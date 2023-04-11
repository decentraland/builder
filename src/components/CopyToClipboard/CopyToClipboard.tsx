import copyText from 'lib/copyText'
import * as React from 'react'

type Props = {
  text: string
  children: React.ReactNode
  role: 'button' | 'option'
  className?: string
  onCopy?: () => void
}

export default class CopyToClipboard extends React.PureComponent<Props> {
  handleCopy = async () => {
    const { text } = this.props
    await copyText(text, () => {
      this.props?.onCopy && this.props.onCopy()
      return
    })
  }

  render() {
    const { children } = this.props
    return (
      <div {...this.props} aria-label="copy" onClick={this.handleCopy}>
        {children}
      </div>
    )
  }
}
