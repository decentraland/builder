import * as React from 'react'

import Icon from 'components/Icon'
import { Props, DefaultProps } from './CloseModalIcon.types'

import './CloseModalIcon.css'

export default class CloseModalIcon extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    onClick: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }

  render() {
    const { onClick } = this.props

    return (
      <div className="CloseModalIcon" onClick={onClick}>
        <Icon name="close" />
      </div>
    )
  }
}
