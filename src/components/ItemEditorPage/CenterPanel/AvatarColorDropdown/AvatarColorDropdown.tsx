import React from 'react'
import { Color4 } from 'decentraland-ecs'
import { Dropdown, DropdownItemProps } from 'decentraland-ui'
import { Props } from './AvatarColorDropdown.types'

export default class AvatarColorDropdown extends React.PureComponent<Props> {
  handleAvatarColorChange = (_event: React.SyntheticEvent<HTMLDivElement>, data: DropdownItemProps) => {
    const { currentTone, tones, onChange } = this.props
    if (currentTone.toHexString() !== data.value) {
      const newColor = tones.find(tone => tone.toHexString() === data.value)
      onChange(newColor!)
    }
  }

  renderItem = (color: Color4, index: number) => {
    const hexString = color.toHexString()
    return (
      <Dropdown.Item key={index} value={hexString} onClick={this.handleAvatarColorChange}>
        <i className="tone" style={{ background: hexString }} />
      </Dropdown.Item>
    )
  }

  render() {
    const { currentTone, tones, label } = this.props

    const currentHexString = currentTone.toHexString()
    return (
      <div className="dropdown-container">
        <Dropdown
          inline
          direction="right"
          className="Select tones"
          value={currentHexString}
          trigger={
            <>
              <div className="label">{label}</div>
              <div className="value">
                <i className="tone" style={{ background: currentHexString }} />
              </div>
              <div className="handle" />
            </>
          }
        >
          <Dropdown.Menu className="tones-menu">{tones.map(this.renderItem)}</Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }
}
