import * as React from 'react'
import type { Wearable } from 'decentraland-ecs'
import { BodyShape, PreviewEmote, WearableCategory } from '@dcl/schemas'
import {
  Dropdown,
  DropdownProps,
  Popup,
  Icon,
  Loader,
  Center,
  EmoteControls,
  DropdownItemProps,
  Button,
  WearablePreview
} from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import { Color4 } from 'lib/colors'
import { isDevelopment } from 'lib/environment'
import { extractThirdPartyTokenId, extractTokenId, isThirdParty } from 'lib/urn'
import { isTPCollection } from 'modules/collection/utils'
import { ItemType } from 'modules/item/types'
import { isEmote } from 'modules/item/utils'
import { toBase64, toHex } from 'modules/editor/utils'
import { getSkinColors, getEyeColors, getHairColors } from 'modules/editor/avatar'
import BuilderIcon from 'components/Icon'
import { ControlOptionAction } from 'components/Modals/CreateSingleItemModal/EditThumbnailStep/EditThumbnailStep.types'
import AvatarColorDropdown from './AvatarColorDropdown'
import AvatarWearableDropdown from './AvatarWearableDropdown'
import { Props, State } from './CenterPanel.types'
import './CenterPanel.css'

export default class CenterPanel extends React.PureComponent<Props, State> {
  state = {
    showSceneBoundaries: false,
    isShowingAvatarAttributes: false,
    isLoading: false
  }

  analytics = getAnalytics()

  componentDidMount() {
    const {
      address,
      collection,
      emotes,
      selectedBaseWearables: bodyShapeBaseWearables,
      hasUserOrphanItems,
      onFetchBaseWearables,
      onFetchOrphanItems,
      onFetchCollectionItems
    } = this.props
    const hasEmotesLoaded = emotes.length > 0

    if (!bodyShapeBaseWearables) {
      onFetchBaseWearables()
    }

    // Fetch emotes created by the user to show them in the Play Emote dropdown
    if (!hasEmotesLoaded) {
      // The TP collections wouldn't have emotes soon, for this reason, we are fetching only standard collections to show in the Play Emote dropdown
      if (collection && !isTPCollection(collection)) {
        onFetchCollectionItems(collection.id)
      } else if (address && hasUserOrphanItems) {
        // TODO: Remove this call when there are no users with orphan items
        onFetchOrphanItems(address)
      }
    }

    this.setState({ isLoading: true })
  }

  componentWillUnmount() {
    const { onSetWearablePreviewController } = this.props
    onSetWearablePreviewController(null)
  }

  handleToggleShowingAvatarAttributes = () => {
    this.setState({ isShowingAvatarAttributes: !this.state.isShowingAvatarAttributes })
  }

  handleBodyShapeChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    const { onSetBodyShape } = this.props
    onSetBodyShape(value as BodyShape)
  }

  handleAnimationChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownItemProps) => {
    const { emotes, visibleItems, onSetAvatarAnimation, onSetItems } = this.props
    const emote = emotes.find(emote => emote.id === value)
    const newVisibleItems = visibleItems.filter(item => item.type !== ItemType.EMOTE)

    newVisibleItems.forEach(item => {
      this.analytics?.track('Play Emote', {
        EMOTE_PLAYED_BASE: !emote,
        EMOTE_PLAYED_ITEM_ID: emote?.urn ? extractTokenId(emote.urn) : null,
        EMOTE_PLAYED_NAME: emote ? emote.name : value,
        PREVIEWED_WEARABLE_ITEM_ID: item?.urn
          ? isThirdParty(item.urn)
            ? extractThirdPartyTokenId(item.urn)
            : extractTokenId(item.urn)
          : null,
        PREVIEWED_WEARABLE_NAME: item.name
      })
    })

    if (emote) {
      newVisibleItems.push(emote)
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

    // Set loading to false when the WearablePreview is loaded
    this.setState({ isLoading: false })
  }

  handleControlActionChange = async (action: ControlOptionAction) => {
    const { wearableController } = this.props
    const ZOOM_DELTA = 0.1

    if (wearableController) {
      await wearableController?.emote.pause()
      switch (action) {
        case ControlOptionAction.ZOOM_IN: {
          await wearableController?.scene.changeZoom(ZOOM_DELTA)
          break
        }
        case ControlOptionAction.ZOOM_OUT: {
          await wearableController?.scene.changeZoom(-ZOOM_DELTA)
          break
        }
        default:
          break
      }
    }
  }

  handlePlayEmote = () => {
    const { wearableController, isPlayingEmote, visibleItems, onSetAvatarAnimation, onSetItems } = this.props
    const newVisibleItems = visibleItems.filter(item => item.type !== ItemType.EMOTE)

    if (isPlayingEmote) {
      onSetAvatarAnimation(PreviewEmote.IDLE)
      onSetItems(newVisibleItems)
    } else {
      wearableController?.emote.play() as void
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
    const { collection, emotes, isPlayingEmote } = this.props
    const areEmotesFromCollection = !!collection
    const hasEmotes = emotes.length > 0

    if (isPlayingEmote) return null

    return (
      <Dropdown className="avatar-animation button icon" floating scrolling>
        <Dropdown.Menu>
          {hasEmotes && (
            <>
              <Dropdown.Header
                content={areEmotesFromCollection ? t('item_editor.center_panel.from_collection') : t('item_editor.center_panel.from_items')}
              />
              <Dropdown.Divider />
              {emotes.map(value => (
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

  renderEmoteDropdownUnity = () => {
    const { collection, emotes, emote, visibleItems } = this.props
    const areEmotesFromCollection = !!collection
    const hasEmotes = emotes.length > 0

    // Find the current emote display name
    let currentEmoteName = t('item_editor.center_panel.play_emote') // Default to "Play Emote"

    // First check if there's a custom emote in visibleItems
    const visibleEmote = visibleItems.find(item => item.type === ItemType.EMOTE)
    if (visibleEmote) {
      currentEmoteName = visibleEmote.name
    } else if (emote && emote !== PreviewEmote.IDLE) {
      // If no custom emote in visibleItems, check the emote prop for default emotes
      // Check if it's a custom emote from the user's emotes
      if (hasEmotes) {
        const customEmote = emotes.find(e => e.id === emote)
        if (customEmote) {
          currentEmoteName = customEmote.name
        } else {
          // It's a default emote
          currentEmoteName = t(`emotes.${emote}`)
        }
      } else {
        // It's a default emote
        currentEmoteName = t(`emotes.${emote}`)
      }
    }

    return (
      <Dropdown className="avatar-animation button icon unity-emote-dropdown" floating scrolling text={currentEmoteName}>
        <Dropdown.Menu>
          {hasEmotes && (
            <>
              <Dropdown.Header
                content={areEmotesFromCollection ? t('item_editor.center_panel.from_collection') : t('item_editor.center_panel.from_items')}
              />
              <Dropdown.Divider />
              {emotes.map(value => (
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
    const { isUnityWearablePreviewEnabled } = this.props

    return (
      <Popup
        content={t('item_editor.center_panel.disabled_animation_dropdown')}
        disabled
        position="top center"
        trigger={
          <div className="avatar-animation-dropdown-wrapper option">
            <Button.Group>
              {isUnityWearablePreviewEnabled ? (
                this.renderEmoteDropdownUnity()
              ) : (
                <>
                  {this.renderEmotePlayButton()}
                  {this.renderEmoteDropdownButton()}
                </>
              )}
            </Button.Group>
          </div>
        }
      />
    )
  }

  render() {
    const {
      bodyShape,
      skinColor,
      eyeColor,
      hairColor,
      emote,
      selectedBaseWearables,
      selectedItem,
      visibleItems,
      wearableController,
      isImportFilesModalOpen,
      isUnityWearablePreviewEnabled
    } = this.props
    const { isShowingAvatarAttributes, showSceneBoundaries, isLoading } = this.state
    const isRenderingAnEmote = visibleItems.some(isEmote) && selectedItem?.type === ItemType.EMOTE
    const zoom = emote === PreviewEmote.JUMP ? 1 : undefined

    return (
      <div className={`CenterPanel ${isImportFilesModalOpen ? 'import-files-modal-is-open' : ''}`}>
        <WearablePreview
          id="wearable-editor"
          baseUrl={config.get('WEARABLE_PREVIEW_URL')}
          profile="default"
          bodyShape={bodyShape}
          emote={emote}
          zoom={zoom}
          skin={toHex(skinColor)}
          eyes={toHex(eyeColor)}
          hair={toHex(hairColor)}
          urns={
            selectedBaseWearables
              ? Object.values(selectedBaseWearables)
                  .map(wearable => (wearable ? wearable.id : null))
                  .filter(urn => urn !== null)
              : []
          }
          base64s={visibleItems.map(toBase64)}
          disableAutoRotate
          disableBackground
          wheelZoom={1.5}
          wheelStart={100}
          dev={isDevelopment}
          onUpdate={() => this.setState({ isLoading: true })}
          onLoad={this.handleWearablePreviewLoad}
          disableDefaultEmotes={isRenderingAnEmote}
          showSceneBoundaries={showSceneBoundaries}
          unity={isUnityWearablePreviewEnabled}
          unityMode={'builder'}
        />
        {isRenderingAnEmote && !isUnityWearablePreviewEnabled ? (
          <div className="zoom-controls">
            <Button className="zoom-control zoom-in-control" onClick={() => this.handleControlActionChange(ControlOptionAction.ZOOM_IN)}>
              <Icon name="plus" />
            </Button>
            <Button className="zoom-control zoom-out-control" onClick={() => this.handleControlActionChange(ControlOptionAction.ZOOM_OUT)}>
              <Icon name="minus" />
            </Button>
          </div>
        ) : null}
        {isLoading && (
          <Center>
            <Loader active />
          </Center>
        )}
        <div className="footer">
          {isRenderingAnEmote && !isLoading && wearableController && !isUnityWearablePreviewEnabled ? (
            <div className="emote-controls-container">
              <EmoteControls
                className="emote-controls"
                wearablePreviewId="wearable-editor"
                wearablePreviewController={wearableController}
              />
            </div>
          ) : null}
          <div className="options">
            <div className={`option ${isShowingAvatarAttributes ? 'active' : ''}`} onClick={this.handleToggleShowingAvatarAttributes}>
              <Icon name="user" />
            </div>
            {isRenderingAnEmote ? null : this.renderEmoteSelector()}
            {!isUnityWearablePreviewEnabled ? (
              <div className={`option show-scene-boundaries-option ${showSceneBoundaries ? 'active' : ''}`}>
                <BuilderIcon
                  name="cylinder"
                  onClick={() => this.setState(prevState => ({ showSceneBoundaries: !prevState.showSceneBoundaries }))}
                />
              </div>
            ) : null}
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
