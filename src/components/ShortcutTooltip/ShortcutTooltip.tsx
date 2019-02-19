import * as React from 'react'
import { Popup } from 'decentraland-ui'

import { SimpleShortcut, ShortcutDefinition, ShortcutCombination, ShortcutAlternative } from 'modules/keyboard/types'
import { mapLabel } from 'modules/keyboard/utils'

import { Props } from './ShortcutTooltip.types'
import './ShortcutTooltip.css'

const renderCombination = (shortcut: ShortcutCombination) => {
  let out: string[] = []

  for (let i = 0; i < shortcut.value.length; i++) {
    const label = mapLabel(shortcut.value[i])
    out.push(label.length === 1 ? label.toUpperCase() : label)

    if (i !== shortcut.value.length - 1) {
      out.push('+')
    }
  }

  return out
}

const renderSimple = (shortcut: SimpleShortcut) => {
  const label = mapLabel(shortcut.value)
  return label.length === 1 ? label.toUpperCase() : label
}

const renderAlternative = (shortcut: ShortcutAlternative) => {
  const alternatives = shortcut.value as Array<SimpleShortcut | ShortcutCombination>
  let out: string[] = []

  const item = alternatives[0]
  if (item.type === 'combination') {
    out = [...out, ...renderCombination(item)]
  } else {
    out.push(renderSimple(item))
  }

  return out
}

export default class ShortcutTooltip extends React.PureComponent<Props> {
  static defaultProps = {
    className: '',
    popupClassName: ''
  }

  renderShortcutSequence = (shortcutDefinition: ShortcutDefinition) => {
    if (shortcutDefinition.type === 'combination') {
      return renderCombination(shortcutDefinition).join(' ')
    }

    if (shortcutDefinition.type === 'alternative') {
      return renderAlternative(shortcutDefinition).join(' ')
    }

    return renderSimple(shortcutDefinition as SimpleShortcut)
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
