import * as React from 'react'
import { Color4 } from 'decentraland-ecs'
import { Dropdown, DropdownProps, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ViewPort from 'components/ViewPort'
import { AvatarAnimation, PreviewType } from 'modules/editor/types'
import { getSkinColors, getEyeColors, getHairColors } from 'modules/item/utils'
import { WearableBodyShape } from 'modules/item/types'
import { Props } from './CenterPanel.types'
import './CenterPanel.css'

export default class CenterPanel extends React.PureComponent<Props> {
  componentWillUnmount() {
    const { onClose } = this.props
    onClose()
  }

  handleBodyShapeChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const { onSetBodyShape } = this.props
    onSetBodyShape(value as WearableBodyShape)
  }

  handleAnimationChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const { onSetAvatarAnimation } = this.props
    onSetAvatarAnimation(value as AvatarAnimation)
  }

  handleChangeAvatarColor = (key: 'skinColor' | 'eyeColor' | 'hairColor', value: Color4) => {
    const { onSetAvatarColor } = this.props
    onSetAvatarColor(key, value)
  }

  render() {
    const { bodyShape, avatarAnimation } = this.props
    return (
      <div className="CenterPanel">
        <ViewPort type={PreviewType.WEARABLE} />
        <div className="dropdowns">
          <div className="tones">
            {getHairColors().map((color: Color4) => (
              <i
                key={color.toHexString()}
                style={{ background: color.toHexString() }}
                onClick={() => this.handleChangeAvatarColor('hairColor', color)}
              />
            ))}
          </div>

          <div className="tones">
            {getEyeColors().map((color: Color4) => (
              <i
                key={color.toHexString()}
                style={{ background: color.toHexString() }}
                onClick={() => this.handleChangeAvatarColor('eyeColor', color)}
              />
            ))}
          </div>

          <div className="tones">
            {getSkinColors().map((color: Color4) => (
              <i
                key={color.toHexString()}
                style={{ background: color.toHexString() }}
                onClick={() => this.handleChangeAvatarColor('skinColor', color)}
              />
            ))}
          </div>
          <Dropdown
            className="body-shape"
            value={bodyShape}
            options={[
              { value: WearableBodyShape.MALE, text: t('body_shapes.male') },
              { value: WearableBodyShape.FEMALE, text: t('body_shapes.female') }
            ]}
            onChange={this.handleBodyShapeChange}
          />
          <Popup
            className="disabled-animation-tooltip"
            content={t('item_editor.center_panel.disabled_animation_dropdown')}
            disabled
            position="top center"
            trigger={
              <div className="avatar-animation-dropdown-wrapper">
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
      </div>
    )
  }
}
