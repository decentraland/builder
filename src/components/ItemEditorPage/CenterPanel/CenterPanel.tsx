import * as React from 'react'
import { Color4 } from 'decentraland-ecs'
import { Dropdown, DropdownProps, DropdownItemProps, Popup, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ViewPort from 'components/ViewPort'
import { AvatarAnimation, AvatarColor, PreviewType } from 'modules/editor/types'
import { getSkinColors, getEyeColors, getHairColors } from 'modules/editor/utils'
import { WearableBodyShape } from 'modules/item/types'
import { Props } from './CenterPanel.types'
import './CenterPanel.css'

type State = {
  isShowingAvatarAttributes: boolean
}

export default class CenterPanel extends React.PureComponent<Props, State> {
  state = {
    isShowingAvatarAttributes: false
  }

  componentWillUnmount() {
    const { onClose } = this.props
    onClose()
  }

  handleToggleShowingAvatarAttributes = () => {
    this.setState({ isShowingAvatarAttributes: !this.state.isShowingAvatarAttributes })
  }

  handleBodyShapeChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const { onSetBodyShape } = this.props
    onSetBodyShape(value as WearableBodyShape)
  }

  handleAnimationChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const { onSetAvatarAnimation } = this.props
    onSetAvatarAnimation(value as AvatarAnimation)
  }

  handleAvatarColorChange = (key: AvatarColor, color: Color4) => {
    const { onSetAvatarColor } = this.props
    onSetAvatarColor(key, color)
  }

  renderSelectTrigger(label: string, value: string) {
    return (
      <>
        <div className="label">{label}</div>
        <div className="value">{value}</div>
        <div className="handle" />
      </>
    )
  }

  getDropdownAttributes<T>(value: T, options: any[], label: string) {
    const selected = options.find(option => option.value === value)

    return {
      value,
      options,
      trigger: this.renderSelectTrigger(label, selected ? selected.text : '')
    }
  }

  render() {
    const { bodyShape, skinColor, eyeColor, hairColor, avatarAnimation } = this.props
    const { isShowingAvatarAttributes } = this.state

    return (
      <div className="CenterPanel">
        <ViewPort type={PreviewType.WEARABLE} />
        <div className="footer">
          <div className="options">
            <div className={`option ${isShowingAvatarAttributes ? 'active' : ''}`} onClick={this.handleToggleShowingAvatarAttributes}>
              <Icon name="user" />
            </div>
            <Popup
              className="disabled-animation-tooltip"
              content={t('item_editor.center_panel.disabled_animation_dropdown')}
              disabled
              position="top center"
              trigger={
                <div className="avatar-animation-dropdown-wrapper option">
                  <Dropdown
                    className="avatar-animation"
                    value={avatarAnimation}
                    options={Object.values(AvatarAnimation).map(value => ({ value, text: t(`avatar_animations.${value}`) }))}
                    onChange={this.handleAnimationChange}
                  />
                </div>
              }
            />
          </div>
          <div className={`avatar-attributes ${isShowingAvatarAttributes ? 'active' : ''}`}>
            <div className="dropdown-container">
              <Dropdown
                inline
                direction="right"
                className="Select"
                onChange={this.handleBodyShapeChange}
                {...this.getDropdownAttributes(
                  bodyShape,
                  [
                    { value: WearableBodyShape.MALE, text: t('body_shapes.male') },
                    { value: WearableBodyShape.FEMALE, text: t('body_shapes.female') }
                  ],
                  t('wearable.category.body_shape')
                )}
              />
            </div>

            <AvatarColorDropdown
              currentTone={skinColor}
              tones={getSkinColors()}
              label={t('wearable.color.skin')}
              onChange={color => this.handleAvatarColorChange(AvatarColor.SKIN, color)}
            />
            <AvatarColorDropdown
              currentTone={eyeColor}
              tones={getEyeColors()}
              label={t('wearable.color.eye')}
              onChange={color => this.handleAvatarColorChange(AvatarColor.EYE, color)}
            />
            <AvatarColorDropdown
              currentTone={hairColor}
              tones={getHairColors()}
              label={t('wearable.color.hair')}
              onChange={color => this.handleAvatarColorChange(AvatarColor.HAIR, color)}
            />
          </div>
        </div>
      </div>
    )
  }
}

type AvatarColorDropdownProps = {
  currentTone: Color4
  tones: Color4[]
  label: string
  onChange: (color: Color4) => void
}
export class AvatarColorDropdown extends React.PureComponent<AvatarColorDropdownProps> {
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
