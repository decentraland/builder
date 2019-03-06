import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { SimpleShortcut, ShortcutDefinition } from 'modules/keyboard/types'
import { mapLabel, ShortcutRenderer } from 'modules/keyboard/utils'

import { Props, DefaultProps } from './ShortcutTooltip.types'
import './ShortcutTooltip.css'

class ShortcutTextRenderer extends ShortcutRenderer {
  renderShortcut(shortcut: SimpleShortcut) {
    const label = mapLabel(shortcut.value)
    return label.length === 1 ? label.toUpperCase() : label
  }
  renderPlus() {
    return '+'
  }
  renderOr() {
    return t('global.or')
  }
  renderHold() {
    return t('shortcuts.hold') + ' '
  }
}

const renderer = new ShortcutTextRenderer()

export default class ShortcutTooltip extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    className: '',
    popupClassName: '',
    onOpen: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }

  renderShortcutSequence = (shortcutDefinition: ShortcutDefinition) => {
    if (shortcutDefinition.type === 'combination') {
      return renderer.renderCombination(shortcutDefinition).join(' ')
    }

    if (shortcutDefinition.type === 'alternative') {
      return renderer.renderAlternative(shortcutDefinition, true).join(' ')
    }

    return renderer.renderShortcut(shortcutDefinition)
  }

  render() {
    const { shortcutDefinition, children, position, className, popupClassName, onOpen } = this.props
    const content = (
      <span className="ShortcutTooltip">
        <span className="label">{shortcutDefinition.title}</span>
        <span className="sequence">({this.renderShortcutSequence(shortcutDefinition)})</span>
      </span>
    )
    return (
      <Popup
        className={popupClassName}
        content={content}
        position={position}
        onOpen={onOpen}
        trigger={<span className={className}>{children}</span>}
        on="hover"
        inverted
      />
    )
  }
}
