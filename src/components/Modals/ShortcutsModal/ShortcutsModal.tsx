import * as React from 'react'
import { Modal } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Chip from 'components/Chip'
import CloseModalIcon from '../CloseModalIcon'
import { Props } from '../Modals.types'

import './ShortcutsModal.css'

export default class ShortcutsModal extends React.PureComponent<Props> {
  handleOnClose = () => {
    const { modal, onClose } = this.props
    onClose(modal.name)
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
            <div className="subtitle">{t('shortcuts_modal.basic_controls.title')}</div>

            <div className="shortcuts">
              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.basic_controls.undo')}</div>
                <div className="keybinding">
                  <Chip text={this.getMainShortcutKey()} />
                  <span className="plus">+</span>
                  <Chip text="z" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.basic_controls.redo')}</div>
                <div className="keybinding">
                  <Chip text={this.getMainShortcutKey()} />
                  <span className="plus">+</span>
                  <Chip text="Shift" />
                  <span className="plus">+</span>
                  <Chip text="z" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.basic_controls.duplicate')}</div>
                <div className="keybinding">
                  <Chip text={this.getMainShortcutKey()} />
                  <span className="plus">+</span>
                  <Chip text="d" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.basic_controls.delete')}</div>
                <div className="keybinding">
                  <Chip text="Delete" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.basic_controls.zoom_in')}</div>
                <div className="keybinding">
                  <Chip text="Shift" />
                  <span className="plus">+</span>
                  <Chip text="+" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.basic_controls.zoom_out')}</div>
                <div className="keybinding">
                  <Chip text="Shift" />
                  <span className="plus">+</span>
                  <Chip text="-" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.basic_controls.reset_camera')}</div>
                <div className="keybinding">
                  <Chip text="Space" />
                </div>
              </div>
            </div>

            <div className="shortcut-list">
              <div className="subtitle">{t('shortcuts_modal.edit_controls.title')}</div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.edit_controls.move')}</div>
                <div className="keybinding">
                  <Chip text="m" />
                </div>
              </div>

              <div className="shortcut">
                <div className="name">{t('shortcuts_modal.edit_controls.rotate')}</div>
                <div className="keybinding">
                  <Chip text="r" />
                </div>
              </div>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}
