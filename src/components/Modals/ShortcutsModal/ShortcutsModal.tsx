import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Chip from 'components/Chip'
import CloseModalIcon from '../CloseModalIcon'
import { Shortcut, ShortcutDefinition, SimpleShortcut } from 'modules/keyboard/types'
import { mapLabel, ShortcutRenderer } from 'modules/keyboard/utils'
import { Props } from './ShortcutModal.types'
import './ShortcutsModal.css'

const ShortcutCategories: Record<string, Shortcut[]> = {
  editor: [
    Shortcut.TOGGLE_SNAP_TO_GRID,
    Shortcut.ZOOM_IN,
    Shortcut.ZOOM_OUT,
    Shortcut.RESET_CAMERA,
    Shortcut.TOGGLE_SIDEBAR,
    Shortcut.PREVIEW,
    Shortcut.UNDO,
    Shortcut.REDO
  ],
  item: [Shortcut.MOVE, Shortcut.ROTATE, Shortcut.DUPLICATE_ITEM, Shortcut.RESET_ITEM, Shortcut.DELETE_ITEM],
  other: [Shortcut.SHORTCUTS]
}

const getCategoryTitles = (): Record<string, string> => ({
  editor: t('shortcuts_modal.editor_shortcuts'),
  item: t('shortcuts_modal.item_shortcuts'),
  other: t('shortcuts_modal.other_shortcuts')
})

class ShortcutChipRenderer extends ShortcutRenderer {
  renderShortcut(shortcut: SimpleShortcut) {
    return <Chip text={mapLabel(shortcut.value)} key={shortcut.value} />
  }
  renderPlus(key: number) {
    return (
      <span className="plus" key={key}>
        +
      </span>
    )
  }
  renderOr() {
    return (
      <span className="plus" key="or">
        {t('global.or')}
      </span>
    )
  }
  renderHold() {
    return (
      <span className="hold" key="hold">
        {t('shortcuts.hold')}
      </span>
    )
  }
}

const renderer = new ShortcutChipRenderer()

export default class ShortcutsModal extends React.PureComponent<Props> {
  renderShortcutSequence = (shortcutDefinition: ShortcutDefinition) => {
    if (shortcutDefinition.type === 'combination') {
      return renderer.renderCombination(shortcutDefinition)
    }

    if (shortcutDefinition.type === 'alternative') {
      return renderer.renderAlternative(shortcutDefinition)
    }

    return renderer.renderSimple(shortcutDefinition as SimpleShortcut)
  }

  renderShortcuts = () => {
    const { shortcuts } = this.props
    const categories = getCategoryTitles()

    return Object.keys(ShortcutCategories).map(category => {
      const categoryShortcuts = ShortcutCategories[category]
      return (
        <div className="shortcut-list">
          <div className="subtitle">{categories[category]}</div>
          <div className="shortcuts">
            {categoryShortcuts.map(shortcut => {
              const shortcutDefinition = shortcuts[shortcut]
              const sequence = this.renderShortcutSequence(shortcutDefinition)

              return (
                <div className="shortcut">
                  <div className="name">{shortcutDefinition.title}</div>
                  <div className="keybinding">{sequence}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    })
  }

  renderCategory = (category: keyof typeof ShortcutCategories) => {
    const { shortcuts } = this.props

    return ShortcutCategories[category].map(shortcut => {
      const shortcutDefinition = shortcuts[shortcut]

      return (
        <div className="shortcut" key={shortcut}>
          <div className="name">{shortcutDefinition.title}</div>
          <div className="keybinding">{this.renderShortcutSequence(shortcutDefinition)}</div>
        </div>
      )
    })
  }

  render() {
    const { name, onClose } = this.props
    const categories = getCategoryTitles()

    return (
      <Modal name={name} closeIcon={<CloseModalIcon onClick={onClose} />}>
        <Modal.Content>
          <div className="title">{t('shortcuts_modal.title')}</div>

          <div className="shortcut-list">
            <div className="subtitle">{categories['editor']}</div>
            <div className="shortcuts">
              <div className="shortcut">
                <div className="name">{t('shortcuts.move_camera')}</div>
                <div className="keybinding">
                  <Chip icon="arrow-key-up" />
                  <Chip icon="arrow-key-down" />
                  <Chip icon="arrow-key-left" />
                  <Chip icon="arrow-key-down" />
                </div>
              </div>
              <div className="shortcut">
                <div className="name">{t('shortcuts.toggle_colliders')}</div>
                <div className="keybinding">
                  <Chip text="c" />
                </div>
              </div>
              {this.renderCategory('editor')}
            </div>
          </div>

          <div className="shortcut-list">
            <div className="subtitle">{categories['item']}</div>
            <div className="shortcuts">{this.renderCategory('item')}</div>
          </div>

          <div className="shortcut-list">
            <div className="subtitle">{categories['other']}</div>
            <div className="shortcuts">{this.renderCategory('other')}</div>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}
