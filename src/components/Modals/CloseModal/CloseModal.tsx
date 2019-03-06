import * as React from 'react'

import Icon from 'components/Icon'
import { Props, DefaultProps } from './CloseModal.types'

import './CloseModal.css'

export default class CloseModal extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    onClick: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }

  render() {
    const { onClick } = this.props

    return (
      <div className="CloseModal" onClick={onClick}>
        <Icon name="close" />
      </div>
    )
  }
}
