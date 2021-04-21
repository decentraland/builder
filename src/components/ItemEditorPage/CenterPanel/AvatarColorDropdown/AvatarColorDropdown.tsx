import React from 'react'
import { Color4 } from 'decentraland-ecs'
import { Dropdown, DropdownItemProps } from 'decentraland-ui'
import { Props } from './AvatarColorDropdown.types'
import './AvatarColorDropdown.css'

export default class AvatarColorDropdown extends React.PureComponent<Props> {
  handleAvatarColorChange = (_event: React.SyntheticEvent<HTMLDivElement>, data: DropdownItemProps) => {
    const { currentColor, colors, onChange } = this.props
    if (currentColor.toHexString() !== data.value) {
      const newColor = colors.find(color => color.toHexString() === data.value)
      onChange(newColor!)
    }
  }

  renderItem = (color: Color4, index: number) => {
    const hexString = color.toHexString()
    return (
      <Dropdown.Item key={index} value={hexString} onClick={this.handleAvatarColorChange}>
        <i className="color" style={{ background: hexString }} />
      </Dropdown.Item>
    )
  }

  render() {
    const { currentColor, colors, label } = this.props

    const currentHexString = currentColor.toHexString()
    return (
      <Dropdown
        inline
        direction="right"
        className="AvatarColorDropdown Select"
        value={currentHexString}
        trigger={
          <>
            <div className="label">{label}</div>
            <div className="value">
              <i className="color" style={{ background: currentHexString }} />
            </div>
            <div className="handle" />
          </>
        }
      >
        <Dropdown.Menu className="colors-menu">{colors.map(this.renderItem)}</Dropdown.Menu>
      </Dropdown>
    )
  }
}
