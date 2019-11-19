import * as React from 'react'

import { Props, DefaultProps } from './Icon.types'
import './Icon.css'
import './sprite.css'

const noop = (_: React.MouseEvent<HTMLElement>) => {
  /* noop */
}

export default class Icon extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    isActive: false,
    className: ''
  }

  render() {
    const { name, isActive, onClick, className } = this.props
    const iconName = isActive ? `${name}-active` : name
    return <div className={`Icon ${iconName} ${onClick ? 'clickeable' : ''} ` + className} onClick={onClick || noop} />
  }
}
