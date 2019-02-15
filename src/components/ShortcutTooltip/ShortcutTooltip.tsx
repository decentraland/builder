import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { ShortcutCombination, SimpleShortcut, ShortcutAlternative, ShortcutDefinition } from 'modules/keyboard/types'
import { mapLabel } from 'modules/keyboard/utils'
import Chip from 'components/Chip'
import { Props } from './ShortcutTooltip.types'
import './ShortcutTooltip.css'

export default class ShortcutTooltip extends React.PureComponent<Props> {
  static defaultProps = {
    className: ''
  }

  renderCombination = (shortcut: ShortcutCombination) => {
    let out: JSX.Element[] = []

    for (let i = 0; i < shortcut.value.length; i++) {
      out.push(<Chip text={mapLabel(shortcut.value[i])} />)

      if (i !== shortcut.value.length - 1) {
        out.push(<span className="plus">+</span>)
      }
    }

    return out
  }

  renderSimple = (shortcut: SimpleShortcut) => {
    return <Chip text={mapLabel(shortcut.value)} />
  }

  renderAlternative = (shortcut: ShortcutAlternative) => {
    const alternatives = shortcut.value as Array<SimpleShortcut | ShortcutCombination>
    const item = alternatives[0]
    let out: JSX.Element[] = []

    if (item.type === 'combination') {
      out = [...out, ...this.renderCombination(item)]
    } else {
      out.push(this.renderSimple(item))
    }

    return out
  }

  renderShortcutSequence = (shortcutDefinition: ShortcutDefinition) => {
    if (shortcutDefinition.type === 'combination') {
      return this.renderCombination(shortcutDefinition)
    }

    if (shortcutDefinition.type === 'alternative') {
      return this.renderAlternative(shortcutDefinition)
    }

    return this.renderSimple(shortcutDefinition as SimpleShortcut)
  }

  render() {
    const { shortcutDefinition, children, position, className } = this.props
    const content = (
      <span className="ShortcutTooltip">
        <span className="label">{shortcutDefinition.title}</span>
        <span className="sequence">{this.renderShortcutSequence(shortcutDefinition)}</span>
      </span>
    )
    return <Popup content={content} position={position} trigger={<span className={className}>{children}</span>} on="hover" inverted />
  }
}
