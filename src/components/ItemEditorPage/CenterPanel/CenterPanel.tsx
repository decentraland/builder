import * as React from 'react'
import { Color4 } from 'decentraland-ecs'
import { Dropdown, DropdownProps, Popup, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ViewPort from 'components/ViewPort'
import { AvatarAnimation, PreviewType } from 'modules/editor/types'
import { getSkinColors, getEyeColors, getHairColors } from 'modules/editor/avatar'
import { WearableBodyShape } from 'modules/item/types'
import AvatarColorDropdown from './AvatarColorDropdown'
import { Props, State } from './CenterPanel.types'
import './CenterPanel.css'

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

  handleSkinColorChange = (color: Color4) => {
    const { onSetSkinColor } = this.props
    onSetSkinColor(color)
  }

  handleEyeColorChange = (color: Color4) => {
    const { onSetEyeColor } = this.props
    onSetEyeColor(color)
  }

  handleHairColorChange = (color: Color4) => {
    const { onSetHairColor } = this.props
    onSetHairColor(color)
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

            <div className="dropdown-container">
              <AvatarColorDropdown
                currentColor={skinColor}
                colors={getSkinColors()}
                label={t('wearable.color.skin')}
                onChange={this.handleSkinColorChange}
              />
            </div>
            <div className="dropdown-container">
              <AvatarColorDropdown
                currentColor={eyeColor}
                colors={getEyeColors()}
                label={t('wearable.color.eye')}
                onChange={this.handleEyeColorChange}
              />
            </div>
            <div className="dropdown-container">
              <AvatarColorDropdown
                currentColor={hairColor}
                colors={getHairColors()}
                label={t('wearable.color.hair')}
                onChange={this.handleHairColorChange}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
