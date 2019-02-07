import * as React from 'react'

import { Props } from './Icon.types'
import './Icon.css'
import './sprite.css'

export default class Icon extends React.PureComponent<Props> {
  static defaultProps = {
    isActive: false,
    className: '',
    onClick: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }

  render() {
    const { name, isActive, onClick, className } = this.props
    const iconName = isActive ? `${name}-active` : name
    return <div className={`Icon ${iconName} ${onClick ? 'clickeable' : ''} ` + className} onClick={onClick} />
  }
}
