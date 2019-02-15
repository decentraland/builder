import * as React from 'react'

import Icon from 'components/Icon'
import ShortcutTooltip from 'components/ShortcutTooltip'
import { ToolName, Props, DefaultProps } from './Tools.types'
import { Shortcut } from 'modules/keyboard/types'

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
        <ShortcutTooltip shortcut={Shortcut.RESET_CAMERA} position="top center" className="tool">
          <Icon name="center-camera" onClick={this.getClickHandler('reset-camera')} />
        </ShortcutTooltip>
        <ShortcutTooltip shortcut={Shortcut.ZOOM_IN} position="top center" className="tool">
          <Icon name="zoom-in" onClick={this.getClickHandler('zoom-in')} />
        </ShortcutTooltip>
        <ShortcutTooltip shortcut={Shortcut.ZOOM_OUT} position="top center" className="tool">
          <Icon name="zoom-out" onClick={this.getClickHandler('zoom-out')} />
        </ShortcutTooltip>
        <ShortcutTooltip shortcut={Shortcut.SHORTCUTS} position="top center" className="tool">
          <Icon name="shortcuts" onClick={this.getClickHandler('shortcuts')} />
        </ShortcutTooltip>
      </div>
    )
  }
}
