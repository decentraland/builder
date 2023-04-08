import copyText from 'lib/copyText'
import * as React from 'react'

type Props = {
  text: string
  children: React.ReactNode
  role: 'button' | 'option'
  className?: string
}

//TODO: if this copyText is not passed anywhere else then just remove this param
export default class CopyToClipboard extends React.PureComponent<Props> {
  handleCopy = async () => {
    const { text } = this.props
    await copyText(text, () => {
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
