import * as React from 'react'
import { getSelection, getCenter, getExplorerURL as getLandURL } from 'modules/land/utils'
import { Props } from './JumpIn.types'
import './JumpIn.css'

export default class JumpIn extends React.PureComponent<Props> {
  jumpToLand = () => {
    const { land } = this.props
    if (land) {
      const selection = getSelection(land)
      const [x, y] = getCenter(selection)
      const newWindow = window.open(getLandURL(x, y), '_blank,noreferrer')
      if (newWindow) {
        newWindow.focus()
      }
    }
  }

  render() {
    const { size = 'medium', land, onJumpIn } = this.props
    return <button aria-label="Jump in" className={`JumpIn ${size}`} onClick={land ? this.jumpToLand : onJumpIn} />
  }
}
