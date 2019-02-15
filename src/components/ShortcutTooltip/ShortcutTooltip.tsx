import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { SimpleShortcut, ShortcutDefinition } from 'modules/keyboard/types'
import { renderAlternative, renderCombination, renderSimple } from 'components/Modals/ShortcutsModal/ShortcutsModal'
import { Props } from './ShortcutTooltip.types'
import './ShortcutTooltip.css'

export default class ShortcutTooltip extends React.PureComponent<Props> {
  static defaultProps = {
    className: ''
  }

  renderShortcutSequence = (shortcutDefinition: ShortcutDefinition) => {
    if (shortcutDefinition.type === 'combination') {
      return renderCombination(shortcutDefinition)
    }

    if (shortcutDefinition.type === 'alternative') {
      return renderAlternative(shortcutDefinition, true)
    }

    return renderSimple(shortcutDefinition as SimpleShortcut)
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
