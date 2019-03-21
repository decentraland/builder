import * as React from 'react'
import { Row } from 'decentraland-ui'

import Icon from 'components/Icon'
import { Props, DefaultProps } from './Chip.types'

import './Chip.css'

export default class Chip extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
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
        <Row center>{text ? <span className="text">{text}</span> : icon ? <Icon name={icon} isActive={isActive} /> : null}</Row>
      </div>
    )
  }
}
