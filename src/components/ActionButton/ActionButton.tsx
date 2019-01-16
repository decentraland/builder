import * as React from 'react'

import Icon from './Icon'
import { Props } from './ActionButton.types'
import './ActionButton.css'

export default class ActionButton extends React.PureComponent<Props> {
  static defaultProps = {
    isActive: false,
    onClick: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }
  render() {
    const { name, isActive, onClick } = this.props
    return (
      <div className={`ActionButton ${isActive ? 'active' : ''}`} onClick={onClick}>
        <div className="centered-container">
          <Icon name={name} isActive={isActive} />
        </div>
      </div>
    )
  }
}
