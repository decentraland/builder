import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { SimpleShortcut, ShortcutDefinition } from 'modules/keyboard/types'
import { mapLabel, ShortcutRenderer } from 'modules/keyboard/utils'

import { Props } from './ShortcutTooltip.types'
import './ShortcutTooltip.css'

class ShortcutTextRenderer extends ShortcutRenderer {
  renderSimple(shortcut: SimpleShortcut) {
    const label = mapLabel(shortcut.value)
    return label.length === 1 ? label.toUpperCase() : label
  }
  renderPlus() {
    return '+'
  }
  renderOr() {
    return t('global.or')
  }
}

const renderer = new ShortcutTextRenderer()

export default class ShortcutTooltip extends React.PureComponent<Props> {
  static defaultProps = {
    className: '',
    popupClassName: ''
  }

  renderShortcutSequence = (shortcutDefinition: ShortcutDefinition) => {
    if (shortcutDefinition.type === 'combination') {
      return renderer.renderCombination(shortcutDefinition).join(' ')
    }

    if (shortcutDefinition.type === 'alternative') {
      return renderer.renderAlternative(shortcutDefinition).join(' ')
    }

    return renderer.renderSimple(shortcutDefinition)
  }

  render() {
    const { shortcutDefinition, children, position, className, popupClassName } = this.props
    const content = (
      <span className="ShortcutTooltip">
        <span className="label">{shortcutDefinition.title}</span>
        <span className="sequence">({this.renderShortcutSequence(shortcutDefinition)})</span>
      </span>
    )
    return (
      <Popup
        content={content}
        position={position}
        trigger={<span className={className}>{children}</span>}
        on="hover"
        inverted
        className={popupClassName}
      />
    )
  }
}
