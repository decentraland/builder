import * as React from 'react'
import { Color4, Wearable } from 'decentraland-ecs'
import { PreviewEmote, WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { Dropdown, DropdownProps, Popup, Icon, Loader, Center } from 'decentraland-ui'
import { WearablePreview } from 'decentraland-ui/dist/components/WearablePreview/WearablePreview'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getSkinColors, getEyeColors, getHairColors } from 'modules/editor/avatar'
import AvatarColorDropdown from './AvatarColorDropdown'
import AvatarWearableDropdown from './AvatarWearableDropdown'
import { Props, State } from './CenterPanel.types'
import './CenterPanel.css'
import { toBase64, toHex } from 'modules/editor/utils'

export default class CenterPanel extends React.PureComponent<Props, State> {
  state = {
    isShowingAvatarAttributes: false,
    isLoading: false
  }

  componentDidMount() {
    const { selectedBaseWearables: bodyShapeBaseWearables, onFetchBaseWearables } = this.props
    if (!bodyShapeBaseWearables) {
      onFetchBaseWearables()
    }

    // Setting the editor as loading as soon as it mounts. It will be turned of by the WearablePreview component once it's ready.
    this.setState({ isLoading: true })
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
    onSetAvatarAnimation(value as PreviewEmote)
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

  handleWearableChange = (category: WearableCategory, bodyShape: WearableBodyShape, wearable: Wearable | null) => {
    const { onSetBaseWearable } = this.props
    onSetBaseWearable(category, bodyShape, wearable)
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
    const { bodyShape, skinColor, eyeColor, hairColor, emote, selectedBaseWearables, visibleItems } = this.props
    const { isShowingAvatarAttributes, isLoading } = this.state

    return (
      <div className="CenterPanel">
        <WearablePreview
          profile="default"
          bodyShape={bodyShape}
          emote={emote}
          skin={toHex(skinColor)}
          eyes={toHex(eyeColor)}
          hair={toHex(hairColor)}
          autoRotateSpeed={0}
          urns={
            selectedBaseWearables
              ? (Object.values(selectedBaseWearables)
                  .map(wearable => (wearable ? wearable.id : null))
                  .filter(urn => urn !== null) as string[])
              : []
          }
          hotreload
          base64s={visibleItems.map(toBase64)}
          transparentBackground
          wheelZoom={1.5}
          wheelStart={100}
          onUpdate={() => this.setState({ isLoading: true })}
          onLoad={() => this.setState({ isLoading: false })}
        />
        {isLoading && (
          <Center>
            <Loader active />
          </Center>
        )}
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
                    value={emote}
                    options={PreviewEmote.schema.enum.map((value: PreviewEmote) => ({ value, text: t(`emotes.${value}`) }))}
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
            <div className="dropdown-container">
              {selectedBaseWearables && (
                <AvatarWearableDropdown
                  wearable={selectedBaseWearables[WearableCategory.HAIR]}
                  category={WearableCategory.HAIR}
                  bodyShape={bodyShape}
                  label={t('wearable.category.hair')}
                  onChange={this.handleWearableChange}
                  isNullable
                />
              )}
            </div>
            <div className="dropdown-container">
              {selectedBaseWearables && (
                <AvatarWearableDropdown
                  wearable={selectedBaseWearables[WearableCategory.FACIAL_HAIR]}
                  category={WearableCategory.FACIAL_HAIR}
                  bodyShape={bodyShape}
                  label={t('wearable.category.facial_hair')}
                  onChange={this.handleWearableChange}
                  isNullable
                />
              )}
            </div>
            <div className="dropdown-container">
              {selectedBaseWearables && (
                <AvatarWearableDropdown
                  wearable={selectedBaseWearables[WearableCategory.UPPER_BODY]}
                  category={WearableCategory.UPPER_BODY}
                  bodyShape={bodyShape}
                  label={t('wearable.category.upper_body')}
                  onChange={this.handleWearableChange}
                />
              )}
            </div>
            <div className="dropdown-container">
              {selectedBaseWearables && (
                <AvatarWearableDropdown
                  wearable={selectedBaseWearables[WearableCategory.LOWER_BODY]}
                  category={WearableCategory.LOWER_BODY}
                  bodyShape={bodyShape}
                  label={t('wearable.category.lower_body')}
                  onChange={this.handleWearableChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
