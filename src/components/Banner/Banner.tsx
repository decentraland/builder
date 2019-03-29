import * as React from 'react'
import { Close } from 'decentraland-ui'

import { Props } from './Banner.types'
import './Banner.css'

export default class HomePage extends React.PureComponent<Props> {
  static defaultProps = {
    isClosable: false,
    onClose: () => {
      /* noop */
    }
  }

  render() {
    const { isClosable, className, onClose, children } = this.props
    let classes = 'Banner'

    if (className) {
      classes += ` ${className}`
    }

    return (
      <div className={classes}>
        <span>{children}</span>
        {isClosable && <Close onClick={onClose} small />}
      </div>
    )
  }
}
