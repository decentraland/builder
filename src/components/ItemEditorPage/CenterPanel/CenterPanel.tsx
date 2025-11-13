import * as React from 'react'
import type { Wearable } from 'decentraland-ecs'
import { BodyShape, PreviewEmote, WearableCategory } from '@dcl/schemas'
import { Dropdown, DropdownProps, Popup, Icon, Loader, Center, EmoteControls, DropdownItemProps, Button } from 'decentraland-ui'
import { AnimationControls, WearablePreview, ZoomControls } from 'decentraland-ui2'
import { SocialEmoteAnimation } from '@dcl/schemas/dist/dapps/preview/social-emote-animation'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Color4 } from 'lib/colors'
import { isDevelopment } from 'lib/environment'
import { extractThirdPartyTokenId, extractTokenId, isThirdParty } from 'lib/urn'
import { isTPCollection } from 'modules/collection/utils'
import { EmoteData, ItemType } from 'modules/item/types'
import { isEmote } from 'modules/item/utils'
import { toBase64, toHex } from 'modules/editor/utils'
import { getSkinColors, getEyeColors, getHairColors } from 'modules/editor/avatar'
import BuilderIcon from 'components/Icon'
import AvatarColorDropdown from './AvatarColorDropdown'
import AvatarWearableDropdown from './AvatarWearableDropdown'
import { Props, State } from './CenterPanel.types'
import './CenterPanel.css'

export default class CenterPanel extends React.PureComponent<Props, State> {
  state = {
    showSceneBoundaries: false,
    isShowingAvatarAttributes: false,
    isLoading: false,
    socialEmote: undefined
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

    // Setting the editor as loading as soon as it mounts. It will be turned of by the WearablePreview component once it's ready.
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

    this.setState({ isLoading: false })
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

  handleSocialEmoteSelect = (animation: SocialEmoteAnimation) => {
    this.setState({ socialEmote: animation })
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
    const {
      bodyShape,
      skinColor,
      eyeColor,
      hairColor,
      emote,
      selectedBaseWearables,
      selectedItem,
      visibleItems,
      isImportFilesModalOpen,
      wearableController
    } = this.props
    const { isShowingAvatarAttributes, showSceneBoundaries, isLoading, socialEmote } = this.state
    const isRenderingAnEmote = visibleItems.some(isEmote) && selectedItem?.type === ItemType.EMOTE
    const zoom = emote === PreviewEmote.JUMP ? 1 : undefined
    let _socialEmote = undefined

    if (!socialEmote && selectedItem?.type === ItemType.EMOTE && (selectedItem.data as unknown as EmoteData).startAnimation) {
      _socialEmote = { title: 'Start Animation', ...(selectedItem.data as unknown as EmoteData).startAnimation, loop: true }
    }

    return (
      <div className={`CenterPanel ${isImportFilesModalOpen ? 'import-files-modal-is-open' : ''}`}>
        <WearablePreview
          baseUrl="https://wearable-preview-1kigg1ihg-decentraland1.vercel.app"
          id="wearable-editor"
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
          socialEmote={socialEmote || _socialEmote}
        />
        {isRenderingAnEmote && !isLoading && wearableController ? (
          <ZoomControls
            className="zoom-controls"
            wearablePreviewId="wearable-editor"
            wearablePreviewController={wearableController as any}
          />
        ) : null}
        {isLoading && (
          <Center>
            <Loader active />
          </Center>
        )}
        <div className="footer">
          {isRenderingAnEmote && !isLoading && wearableController ? (
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
            {isRenderingAnEmote ? (
              !isLoading && wearableController ? (
                <AnimationControls
                  className="animation-controls"
                  wearablePreviewId="wearable-editor"
                  wearablePreviewController={wearableController as any}
                  selectedAnimation={socialEmote}
                  onSelectAnimation={this.handleSocialEmoteSelect}
                />
              ) : null
            ) : (
              this.renderEmoteSelector()
            )}
            <div className={`option ${showSceneBoundaries ? 'active' : ''}`}>
              <BuilderIcon
                name="cylinder"
                onClick={() => this.setState(prevState => ({ showSceneBoundaries: !prevState.showSceneBoundaries }))}
              />
            </div>
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
