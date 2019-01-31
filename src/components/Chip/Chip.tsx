import * as React from 'react'

import Icon from 'components/Icon'
import { Props } from './Chip.types'
import './Chip.css'

export default class Chip extends React.PureComponent<Props> {
  static defaultProps = {
    text: '',
    icon: '',
    type: 'square',
    isDisabled: false,
    isActive: false
  }

  getClassName() {
    const { type, isActive, isDisabled, onClick } = this.props
    const className = ['Chip', type]

    if (isActive) className.push('active')
    if (isDisabled) className.push('disabled')
    if (onClick && !isDisabled) className.push('clickeable')

    return className.join(' ')
  }

  render() {
    const { text, icon, isActive, isDisabled, onClick } = this.props
    if (!text && !icon) {
      throw new Error('You need to provide at least one prop: text or icon')
    }

    return (
      <div className={this.getClassName()} onClick={isDisabled ? undefined : onClick}>
        <div className="centered-container">
          {text ? <span className="text">{text}</span> : icon ? <Icon name={icon} isActive={isActive} /> : null}
        </div>
      </div>
    )
  }
}
