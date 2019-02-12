import * as React from 'react'
import { Modal } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Chip from 'components/Chip'
import CloseModalIcon from '../CloseModalIcon'
import { Props } from '../Modals.types'

import './ShortcutsModal.css'

export default class ShortcutsModal extends React.PureComponent<Props> {
  handleOnClose = () => {
    this.props.onClose('ShortcutsModal')
  }

  getMainShortcutKey() {
    if (navigator.platform === 'MacIntel') return '⌘'
    return 'Ctrl'
  }

  render() {
    const { modal } = this.props

    return (
      <Modal
        open={modal.open}
        className="ShortcutsModal"
        size="small"
        onClose={this.handleOnClose}
        closeIcon={<CloseModalIcon onClick={this.handleOnClose} />}
      >
        <Modal.Content>
          <div className="title">{t('shortcuts_modal.title')}</div>

          <div className="shortcut-list">
            <div className="subtitle">{t('shortcuts_modal.editor_shortcuts')}</div>

            <div className="shortcuts">
              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.move_camera')}</div>
                <div className="keybinding">
                  <Chip text="▲" />
                  <Chip text="▼" />
                  <Chip text="◄" />
                  <Chip text="►" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.zoom_in')}</div>
                <div className="keybinding">
                  <Chip text="Shift" />
                  <span className="plus">+</span>
                  <Chip text="+" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.zoom_out')}</div>
                <div className="keybinding">
                  <Chip text="Shift" />
                  <span className="plus">+</span>
                  <Chip text="-" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.reset_camera')}</div>
                <div className="keybinding">
                  <Chip text="Space" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.toggle_colliders')}</div>
                <div className="keybinding">
                  <Chip text="c" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.toggle_sidebar')}</div>
                <div className="keybinding">
                  <Chip text="p" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.play_mode')}</div>
                <div className="keybinding">
                  <Chip text="o" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.undo')}</div>
                <div className="keybinding">
                  <Chip text={this.getMainShortcutKey()} />
                  <span className="plus">+</span>
                  <Chip text="z" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.redo')}</div>
                <div className="keybinding">
                  <Chip text={this.getMainShortcutKey()} />
                  <span className="plus">+</span>
                  <Chip text="Shift" />
                  <span className="plus">+</span>
                  <Chip text="z" />
                </div>
              </div>
            </div>

            <div className="shortcut-list">
              <div className="subtitle">{t('shortcuts_modal.item_shortcuts')}</div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.move')}</div>
                <div className="keybinding">
                  <Chip text="w" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.rotate')}</div>
                <div className="keybinding">
                  <Chip text="e" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.duplicate')}</div>
                <div className="keybinding">
                  <Chip text="d" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.reset')}</div>
                <div className="keybinding">
                  <Chip text="s" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.delete')}</div>
                <div className="keybinding">
                  <Chip text="Delete" />
                </div>
              </div>
            </div>
          </div>

          <div className="shortcut-list">
            <div className="subtitle">{t('shortcuts_modal.other_shortcuts')}</div>
            <div className="shortcut">
              <div className="name">{t('shortcuts_modal.shortcut_reference')}</div>
              <div className="keybinding">
                <Chip text="?" />
              </div>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}
