import * as React from 'react'
import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
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

  handleClick = () => {
    const { land, onJumpIn } = this.props
    return land ? this.jumpToLand() : onJumpIn()
  }

  render() {
    const { size = 'medium', text, active = false, disabled = false } = this.props
    return text ? (
      <Button basic className="JumpInContainer" size={size} disabled={disabled} onClick={this.handleClick}>
        <span className={classNames('JumpIn', size, { active })} />
        <span className={classNames('text', { active })}>{text}</span>
      </Button>
    ) : (
      <button aria-label="Jump in" className={classNames('JumpIn', size, { active })} onClick={this.handleClick} />
    )
  }
}
