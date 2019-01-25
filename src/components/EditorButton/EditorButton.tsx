import * as React from 'react'

import Icon from 'components/Icon'
import { Props } from './EditorButton.types'
import './EditorButton.css'

export default class EditorButton extends React.PureComponent<Props> {
  static defaultProps = {
    isActive: false,
    onClick: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }
  render() {
    const { name, isActive, onClick } = this.props
    return (
      <div className={`EditorButton ${isActive ? 'active' : ''}`} onClick={onClick}>
        <div className="centered-container">
          <Icon name={name} isActive={isActive} />
        </div>
      </div>
    )
  }
}
