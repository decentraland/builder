import * as React from 'react'

import Icon from 'components/Icon'
import { ToolName, Props } from './Tools.types'

export default class Tools extends React.PureComponent<Props> {
  static defaultProps = {
    onClick: (toolName: ToolName) => {
      /* noop */
    }
  }

  getClickHandler(toolName: ToolName) {
    return () => this.props.onClick(toolName)
  }

  render() {
    return (
      <div className="Tools">
        <Icon name="shortcuts" onClick={this.getClickHandler('shortcuts')} />
      </div>
    )
  }
}
