import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'

import Icon from 'components/Icon'
import ShortcutTooltip from 'components/ShortcutTooltip'
import { Props as ShortcutTooltipProps } from 'components/ShortcutTooltip/ShortcutTooltip.types'
import { IconName } from 'components/Icon/Icon.types'
import { Shortcut } from 'modules/keyboard/types'
import { ToolName, Props, DefaultProps, State } from './Tools.types'
import { ClosePopup } from 'components/Popups'

const localStorage = getLocalStorage()

export default class Tools extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    onClick: (_: ToolName) => {
      /* noop */
    }
  }

  state = {
    isShortcutHelpOpen: !localStorage.getItem('help-shortcut-seen')
  }

  componentWillMount() {
    window.addEventListener('resize', this.closeShortcutHelp)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.closeShortcutHelp)
  }

  getClickHandler(toolName: ToolName) {
    return () => this.props.onClick(toolName)
  }

  handleCloseShortcutHelp = () => {
    this.closeShortcutHelp()
    localStorage.setItem('help-shortcut-seen', '1')
  }

  closeShortcutHelp = () => {
    this.setState({ isShortcutHelpOpen: false })
  }

  renderIcon(iconName: ToolName, shortcut: Shortcut, onOpen?: ShortcutTooltipProps['onOpen']) {
    return (
      <ShortcutTooltip shortcut={shortcut} position="top center" className="tool" onOpen={onOpen}>
        <Icon name={iconName as IconName} onClick={this.getClickHandler(iconName)} />
      </ShortcutTooltip>
    )
  }

  render() {
    const { isShortcutHelpOpen } = this.state

    return (
      <div className="Tools">
        {this.renderIcon('reset-camera', Shortcut.RESET_CAMERA)}
        {this.renderIcon('zoom-in', Shortcut.ZOOM_IN)}
        {this.renderIcon('zoom-out', Shortcut.ZOOM_OUT)}

        <Popup
          open={isShortcutHelpOpen}
          content={<ClosePopup onClick={this.closeShortcutHelp} />}
          position="top center"
          trigger={this.renderIcon('shortcuts', Shortcut.SHORTCUTS, this.closeShortcutHelp)}
          on="hover"
          inverted
        />
      </div>
    )
  }
}
