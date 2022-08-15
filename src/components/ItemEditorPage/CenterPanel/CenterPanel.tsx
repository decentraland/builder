import * as React from 'react'
import { Color4, Wearable } from 'decentraland-ecs'
import { BodyShape, PreviewEmote, WearableCategory } from '@dcl/schemas'
import { Dropdown, DropdownProps, Popup, Icon, Loader, Center, EmoteControls, DropdownItemProps, Button } from 'decentraland-ui'
import { WearablePreview } from 'decentraland-ui/dist/components/WearablePreview/WearablePreview'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ItemType } from 'modules/item/types'
import { toBase64, toHex } from 'modules/editor/utils'
import { getSkinColors, getEyeColors, getHairColors } from 'modules/editor/avatar'
import AvatarColorDropdown from './AvatarColorDropdown'
import AvatarWearableDropdown from './AvatarWearableDropdown'
import { Props, State } from './CenterPanel.types'
import './CenterPanel.css'

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
    onSetBodyShape(value as BodyShape)
  }

  handleAnimationChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownItemProps) => {
    const { emotesFromCollection, visibleItems, onSetAvatarAnimation, onSetItems } = this.props
    const emoteFromCollection = emotesFromCollection.find(emote => emote.id === value)
    const newVisibleItems = visibleItems.filter(item => item.type !== ItemType.EMOTE)

    if (emoteFromCollection) {
      newVisibleItems.push(emoteFromCollection)
    } else {
      onSetAvatarAnimation(value as PreviewEmote)
    }

    onSetItems(newVisibleItems)
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

  handleWearableChange = (category: WearableCategory, bodyShape: BodyShape, wearable: Wearable | null) => {
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

  handleWearablePreviewLoad = () => {
    const { wearableController, onSetWearablePreviewController } = this.props

    if (!wearableController) {
      onSetWearablePreviewController(WearablePreview.createController('wearable-editor'))
    }

    this.setState({ isLoading: false })
  }

  handlePlayEmote = () => {
    const { wearableController, isPlayingEmote } = this.props

    if (isPlayingEmote) {
      wearableController?.emote.pause()
    } else {
      wearableController?.emote.play()
    }
  }

  renderEmotePlayButton = () => {
    const { isPlayingEmote } = this.props
    const icon = isPlayingEmote ? 'stop' : 'play'
    const text = isPlayingEmote ? t('item_editor.center_panel.stop') : t('item_editor.center_panel.play_emote')

    return (
      <Button icon onClick={this.handlePlayEmote}>
        <Icon name={icon} />
        <span>{text}</span>
      </Button>
    )
  }

  renderEmoteDropdownButton = () => {
    const { emotesFromCollection, isPlayingEmote } = this.props
    const hasEmotes = emotesFromCollection.length > 0

    if (isPlayingEmote) return null

    return (
      <Dropdown className="avatar-animation button icon" floating>
        <Dropdown.Menu>
          {hasEmotes && (
            <>
              <Dropdown.Header content={t('item_editor.center_panel.from_collection')} />
              <Dropdown.Divider />
              {emotesFromCollection.map(value => (
                <Dropdown.Item key={value.id} value={value.id} text={value.name} onClick={this.handleAnimationChange} />
              ))}
              <Dropdown.Divider />
              <Dropdown.Header content={t('item_editor.center_panel.default')} />
              <Dropdown.Divider />
            </>
          )}
          {PreviewEmote.schema.enum.map((value: PreviewEmote) => (
            <Dropdown.Item key={value} value={value} text={t(`emotes.${value}`)} onClick={this.handleAnimationChange} />
          ))}
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderEmoteSelector = () => {
    return (
      <Popup
        content={t('item_editor.center_panel.disabled_animation_dropdown')}
        disabled
        position="top center"
        trigger={
          <div className="avatar-animation-dropdown-wrapper option">
            <Button.Group>
              {this.renderEmotePlayButton()}
              {this.renderEmoteDropdownButton()}
            </Button.Group>
          </div>
        }
      />
    )
  }

  render() {
    const { bodyShape, skinColor, eyeColor, hairColor, emote, selectedBaseWearables, selectedItem, visibleItems } = this.props
    const { isShowingAvatarAttributes, isLoading } = this.state
    const isRenderingAnEmote = visibleItems.some(item => item.type === ItemType.EMOTE) && selectedItem?.type === ItemType.EMOTE

    return (
      <div className="CenterPanel">
        <WearablePreview
          id="wearable-editor"
          profile="default"
          bodyShape={bodyShape}
          emote={emote}
          skin={toHex(skinColor)}
          eyes={toHex(eyeColor)}
          hair={toHex(hairColor)}
          urns={
            selectedBaseWearables
              ? (Object.values(selectedBaseWearables)
                  .map(wearable => (wearable ? wearable.id : null))
                  .filter(urn => urn !== null) as string[])
              : []
          }
          base64s={visibleItems.map(toBase64)}
          disableAutoRotate
          disableBackground
          wheelZoom={1.5}
          wheelStart={100}
          onUpdate={() => this.setState({ isLoading: true })}
          onLoad={this.handleWearablePreviewLoad}
          disableDefaultEmotes={isRenderingAnEmote}
        />
        {isRenderingAnEmote ? (
          <div className="emote-controls-container">
            <EmoteControls className="emote-controls" wearablePreviewId="wearable-editor" />
          </div>
        ) : null}
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
            {isRenderingAnEmote ? null : this.renderEmoteSelector()}
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
                    { value: BodyShape.MALE, text: t('body_shapes.male') },
                    { value: BodyShape.FEMALE, text: t('body_shapes.female') }
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
