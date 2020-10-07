import * as React from 'react'
import { Props } from './CenterPanel.types'
import './CenterPanel.css'
import ViewPort from 'components/ViewPort'
import { AvatarAnimation, PreviewType } from 'modules/editor/types'
import { Dropdown, Popup } from 'decentraland-ui'
import { WearableBodyShape } from 'modules/item/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

export default class CenterPanel extends React.PureComponent<Props> {
  componentWillUnmount() {
    const { onClose } = this.props
    onClose()
  }

  render() {
    const { bodyShape, onSetBodyShape, avatarAnimation, onSetAvatarAnimation, visibleItems } = this.props
    return (
      <div className="CenterPanel">
        <ViewPort type={PreviewType.WEARABLE} />
        <div className="dropdowns">
          <Dropdown
            className="body-shape"
            value={bodyShape}
            options={[
              { value: WearableBodyShape.MALE, text: t('body_shapes.male') },
              { value: WearableBodyShape.FEMALE, text: t('body_shapes.female') }
            ]}
            onChange={(_event, { value }) => onSetBodyShape(value as WearableBodyShape)}
          />
          <Popup
            className="disabled-animation-tooltip"
            content={t('item_editor.center_panel.disabled_animation_dropdown')}
            disabled={visibleItems.length > 0}
            position="top center"
            trigger={
              <div className="avatar-animation-dropdown-wrapper">
                <Dropdown
                  className="avatar-animation"
                  disabled={visibleItems.length === 0}
                  value={avatarAnimation}
                  options={Object.values(AvatarAnimation).map(value => ({ value, text: t(`avatar_animations.${value}`) }))}
                  onChange={(_event, { value }) => onSetAvatarAnimation(value as AvatarAnimation)}
                />
              </div>
            }
          />
        </div>
      </div>
    )
  }
}
