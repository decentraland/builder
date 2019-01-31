import * as React from 'react'

import Icon from 'components/Icon'
import { Props } from './Key.types'
import './Key.css'

export default class Key extends React.PureComponent<Props> {
  static defaultProps = {
    text: '',
    icon: '',
    type: 'square'
  }

  render() {
    const { text, icon, type } = this.props
    if (!text && !icon) {
      throw new Error('You need to provide at least one prop: text or icon')
    }

    return (
      <div className={`Key ${type}`}>
        <div className="centered-container">{text ? <span className="text">{text}</span> : icon ? <Icon name={icon} /> : null}</div>
      </div>
    )
  }
}
