import * as React from 'react'
import { Popup, Row, Close } from 'decentraland-ui'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Icon from 'components/Icon'
import ShortcutTooltip from 'components/ShortcutTooltip'
import { IconName } from 'components/Icon/Icon.types'
import { debounce } from 'lib/debounce'
import { Shortcut } from 'modules/keyboard/types'
import { ToolName, Props, DefaultProps, State } from './Tools.types'

export const LOCALSTORAGE_SHORTCUT_POPUP_KEY = 'builder-shortcut-popup'
const localStorage = getLocalStorage()

export default class Tools extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    onClick: (_: ToolName) => {
      /* noop */
    }
  }

  state = {
    isShortcutPopupOpen: this.isShortcutPopupDismissed()
  }

  _isMounted: boolean = false

  updatePopupPositionDebounced = debounce(() => this.updatePopupPosition(), 200)

  componentWillMount() {
    window.addEventListener('resize', this.handleResize)
    this._isMounted = true
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.state.isShortcutPopupOpen && this.props.isSidebarOpen !== nextProps.isSidebarOpen) {
      this.updatePopupPosition()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this._isMounted = false
  }

  handleCloseShortcutPopup = () => {
    this.closeShortcutPopup()
    localStorage.setItem(LOCALSTORAGE_SHORTCUT_POPUP_KEY, '1')
  }

  handleResize = () => {
    if (this.state.isShortcutPopupOpen) {
      this.closeShortcutPopup()
    }
    this.updatePopupPositionDebounced()
  }

  handleShorcutIconClick = () => {
    this.handleCloseShortcutPopup()
    this.props.onClick('shortcuts')
  }

  updatePopupPosition() {
    if (!this._isMounted) return

    // We need to force a Popup re-render to give semantic a chance to re-compute the styles
    // Sadly the implementation doesn't allow for a way to do this cleanly
    this.closeShortcutPopup()
    setTimeout(this.openShortcutPopup)
  }

  openShortcutPopup = () => {
    if (this.isShortcutPopupDismissed()) {
      this.setState({ isShortcutPopupOpen: true })
    }
  }

  closeShortcutPopup = () => {
    this.setState({ isShortcutPopupOpen: false })
  }

  isShortcutPopupDismissed() {
    return !localStorage.getItem(LOCALSTORAGE_SHORTCUT_POPUP_KEY)
  }

  renderShortcutIcon() {
    return (
      <ShortcutTooltip
        shortcut={Shortcut.SHORTCUTS}
        className="tool"
        position="top center"
        onOpen={this.closeShortcutPopup}
        onClose={this.openShortcutPopup}
      >
        <Icon name="shortcuts" onClick={this.handleShorcutIconClick} />
      </ShortcutTooltip>
    )
  }

  renderIcon(iconName: ToolName, shortcut: Shortcut) {
    return (
      <ShortcutTooltip
        shortcut={shortcut}
        className="tool"
        position="top center"
        onOpen={this.closeShortcutPopup}
        onClose={this.openShortcutPopup}
      >
        <Icon name={iconName as IconName} onClick={this.getClickHandler(iconName)} />
      </ShortcutTooltip>
    )
  }

  getClickHandler(toolName: ToolName) {
    return () => this.props.onClick(toolName)
  }

  render() {
    const { isShortcutPopupOpen } = this.state

    return (
      <div className="Tools">
        {this.renderIcon('reset-camera', Shortcut.RESET_CAMERA)}
        {this.renderIcon('zoom-in', Shortcut.ZOOM_IN)}
        {this.renderIcon('zoom-out', Shortcut.ZOOM_OUT)}

        <Popup
          open={isShortcutPopupOpen && this.isShortcutPopupDismissed()}
          className="shortcut-popup"
          content={
            <Row center>
              {t('popups.shortcuts_help')}
              <Close small onClick={this.handleCloseShortcutPopup} />
            </Row>
          }
          position="top right"
          verticalOffset={3}
          trigger={this.renderShortcutIcon()}
          on="hover"
          inverted
        />
      </div>
    )
  }
}
