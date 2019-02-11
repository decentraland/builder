import * as React from 'react'

import Icon from 'components/Icon'
import { ToolName, Props, DefaultProps } from './Tools.types'

export default class Tools extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    onClick: (_: ToolName) => {
      /* noop */
    }
  }

  getClickHandler(toolName: ToolName) {
    return () => this.props.onClick(toolName)
  }

  render() {
    return (
      <div className="Tools">
        <Icon name="center-camera" onClick={this.getClickHandler('reset-camera')} />
        <Icon name="zoom-in" onClick={this.getClickHandler('zoom-in')} />
        <Icon name="zoom-out" onClick={this.getClickHandler('zoom-out')} />
        <Icon name="shortcuts" onClick={this.getClickHandler('shortcuts')} />
      </div>
    )
  }
}
