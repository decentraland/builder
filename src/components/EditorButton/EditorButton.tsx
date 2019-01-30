import * as React from 'react'

import Icon from 'components/Icon'
import { Props } from './EditorButton.types'
import './EditorButton.css'

export default class EditorButton extends React.PureComponent<Props> {
  static defaultProps = {
    isActive: false,
    isDisabled: false,
    onClick: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }
  render() {
    const { name, isActive, isDisabled, onClick } = this.props
    return (
      <div
        className={`EditorButton ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={isDisabled ? undefined : onClick}
      >
        <div className="centered-container">
          <Icon name={name} isActive={isActive} />
        </div>
      </div>
    )
  }
}
