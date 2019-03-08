import * as React from 'react'

import Icon from 'components/Icon'
import { Props, DefaultProps } from './ClosePopup.types'

import './ClosePopup.css'

export default class ClosePopup extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    text: '',
    onClick: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }

  render() {
    const { text, onClick } = this.props

    return (
      <div className="ClosePopup">
        {text}
        <Icon name="erase" onClick={onClick} />
      </div>
    )
  }
}
