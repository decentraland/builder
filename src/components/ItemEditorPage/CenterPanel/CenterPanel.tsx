import * as React from 'react'
import type { Wearable } from 'decentraland-ecs'
import { BodyShape, PreviewEmote, PreviewUnityMode, WearableCategory } from '@dcl/schemas'
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
  Modal,
  ModalNavigation
} from 'decentraland-ui'
import { AnimationControls, WearablePreview, ZoomControls } from 'decentraland-ui2'
import { SocialEmoteAnimation } from '@dcl/schemas/dist/dapps/preview/social-emote-animation'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import { Color4 } from 'lib/colors'
import { isDevelopment } from 'lib/environment'
import { extractThirdPartyTokenId, extractTokenId, isThirdParty } from 'lib/urn'
import { loadAndValidateModel, EngineType } from 'lib/getModelData'
import { ValidationSeverity } from 'lib/glbValidation/types'
// Validation uses content storage URLs instead of blob URLs
import { isTPCollection } from 'modules/collection/utils'
import { EmoteData, ItemType, Item } from 'modules/item/types'
import { isEmote, getModelPath } from 'modules/item/utils'
import { toBase64, toHex } from 'modules/editor/utils'
import { getSkinColors, getEyeColors, getHairColors } from 'modules/editor/avatar'
import BuilderIcon from 'components/Icon'
import { ValidationIssuesPanel } from 'components/ValidationIssuesPanel'
import AvatarColorDropdown from './AvatarColorDropdown'
import AvatarWearableDropdown from './AvatarWearableDropdown'
import { Props, State } from './CenterPanel.types'
import './CenterPanel.css'

export default class CenterPanel extends React.PureComponent<Props, State> {
  state: State = {
    showSceneBoundaries: false,
    isShowingAvatarAttributes: false,
    isLoading: false,
    socialEmote: undefined,
    validationIssues: undefined,
    isValidating: false,
    isValidationModalOpen: false
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

  componentDidUpdate(prevProps: Props) {
    const prev = prevProps.selectedItem
    const curr = this.props.selectedItem

    if (prev?.id !== curr?.id) {
      void this.runValidation()
      return
    }

    // Re-validate when hides or category change (e.g. user edits overrides in the RightPanel)
    if (prev && curr && 'hides' in prev.data && 'hides' in curr.data) {
      const prevHides = (prev.data as { hides?: string[] }).hides
      const currHides = (curr.data as { hides?: string[] }).hides
      const prevCategory = prev.data.category
      const currCategory = curr.data.category

      if (prevCategory !== currCategory || JSON.stringify(prevHides) !== JSON.stringify(currHides)) {
        void this.runValidation()
      }
    }
  }

  componentWillUnmount() {
    const { onSetWearablePreviewController } = this.props
    onSetWearablePreviewController(null)
  }

  runValidation = async () => {
    const { selectedItem } = this.props
    if (!selectedItem || !selectedItem.contents) {
      this.setState({ validationIssues: undefined, isValidating: false })
      return
    }

    this.setState({ isValidating: true, validationIssues: undefined })

    try {
      // Find the model file path from the item's representations
      const modelPath = this.getItemModelPath(selectedItem)
      if (!modelPath) {
        console.warn('Validation: no model path found for item', selectedItem.id)
        this.setState({ isValidating: false })
        return
      }

      // Get the content hash for the model file
      const modelHash = selectedItem.contents[modelPath]
      if (!modelHash) {
        console.warn('Validation: no content hash for model path', modelPath)
        this.setState({ isValidating: false })
        return
      }

      // Fetch the model from the builder's content storage
      const { getContentsStorageUrl } = await import('lib/api/builder')
      const modelUrl = getContentsStorageUrl(modelHash)

      // Also build mappings for textures/resources so the GLTF loader can resolve them
      const contentMappings: Record<string, string> = {}
      for (const [path, hash] of Object.entries(selectedItem.contents)) {
        if (path !== modelPath) {
          contentMappings[path] = getContentsStorageUrl(hash)
        }
      }

      const category = selectedItem.data?.category as WearableCategory | undefined
      const hides = ('hides' in selectedItem.data ? selectedItem.data.hides : undefined) as string[] | undefined
      const { validationResult } = await loadAndValidateModel(
        modelUrl,
        {
          mappings: contentMappings,
          width: 1024,
          height: 1024,
          engine: EngineType.BABYLON
        },
        category,
        undefined,
        hides
      )
      this.setState({ validationIssues: validationResult.issues, isValidating: false })
    } catch (error) {
      console.error('Validation failed:', error)
      // On error, show an empty list so the icon doesn't stay as a gray circle
      this.setState({ validationIssues: [], isValidating: false })
    }
  }

  getItemModelPath = (item: Item): string | undefined => {
    if (item.data && 'representations' in item.data) {
      return getModelPath(item.data.representations as any)
    }
    return undefined
  }

  handleOpenValidationModal = () => {
    const { validationIssues } = this.state
    if (validationIssues && validationIssues.length > 0) {
      this.setState({ isValidationModalOpen: true })
    }
  }

  handleCloseValidationModal = () => {
    this.setState({ isValidationModalOpen: false })
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

    // Run validation once the preview has loaded (item data is ready)
    if (this.state.validationIssues === undefined && !this.state.isValidating) {
      void this.runValidation()
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

  handleSocialEmoteSelect = (animation: SocialEmoteAnimation) => {
    this.setState({ socialEmote: animation })
  }

  renderEmotePlayButton = () => {
    const { isPlayingEmote } = this.props
    const icon = isPlayingEmote ? 'stop' : 'play'
    const text = isPlayingEmote ? t('item_editor.center_panel.stop') : t('item_editor.center_panel.play_emote')

    return (
      <Button icon onClick={this.handlePlayEmote} className="avatar-animation-play">
        <Icon name={icon} />
        <span>{text}</span>
      </Button>
    )
  }

  renderEmoteDropdownButton = (text?: string) => {
    const { collection, emotes } = this.props
    const areEmotesFromCollection = !!collection
    const hasEmotes = emotes.length > 0

    return (
      <Dropdown className="avatar-animation button icon" floating scrolling text={text}>
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
    const { emotes, emote, visibleItems } = this.props
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

    return this.renderEmoteDropdownButton(currentEmoteName)
  }

  renderEmoteSelector = () => {
    const { isUnityWearablePreviewEnabled, isPlayingEmote } = this.props

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
                  {!isPlayingEmote && this.renderEmoteDropdownButton()}
                </>
              )}
            </Button.Group>
          </div>
        }
      />
    )
  }

  renderValidationStatus = () => {
    const { selectedItem } = this.props
    const { validationIssues, isValidating, isLoading: isPreviewLoading } = this.state

    // Show loading state only while validation hasn't produced results yet
    const isWaiting = !validationIssues && (isPreviewLoading || isValidating)

    const hasErrors = validationIssues?.some(i => i.severity === ValidationSeverity.ERROR) ?? false
    const hasWarnings = validationIssues?.some(i => i.severity === ValidationSeverity.WARNING) ?? false
    const hasIssues = hasErrors || hasWarnings
    const isPass = validationIssues !== undefined && !hasIssues
    const isClickable = hasIssues

    let statusClass = ''
    if (hasErrors) statusClass = 'validation-fail'
    else if (hasWarnings) statusClass = 'validation-warn'
    else if (isPass) statusClass = 'validation-pass'

    let tooltipContent: string
    if (!selectedItem || isWaiting) {
      tooltipContent = t('item_editor.center_panel.validation_running')
    } else if (isPass) {
      tooltipContent = t('item_editor.center_panel.validation_pass')
    } else if (hasErrors) {
      tooltipContent = t('item_editor.center_panel.validation_fail')
    } else if (hasWarnings) {
      tooltipContent = t('item_editor.center_panel.validation_warnings')
    } else {
      tooltipContent = t('item_editor.center_panel.validation_tooltip')
    }

    let iconElement: React.ReactNode
    if (!selectedItem || isWaiting) {
      iconElement = <Loader active inline size="tiny" inverted />
    } else if (isPass) {
      iconElement = <Icon name="check circle" className="validation-icon pass" />
    } else if (hasErrors) {
      iconElement = <Icon name="times circle" className="validation-icon fail" />
    } else if (hasWarnings) {
      iconElement = <Icon name="exclamation circle" className="validation-icon warn" />
    } else {
      iconElement = <Loader active inline size="tiny" inverted />
    }

    return (
      <Popup
        content={tooltipContent}
        position="top center"
        trigger={
          <div
            className={`option validation-status ${statusClass}`}
            onClick={isClickable ? this.handleOpenValidationModal : undefined}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
          >
            {iconElement}
          </div>
        }
        hideOnScroll
        on="hover"
        inverted
      />
    )
  }

  renderValidationModal = () => {
    const { validationIssues, isValidationModalOpen } = this.state

    if (!isValidationModalOpen || !validationIssues) return null

    return (
      <Modal open size="small" onClose={this.handleCloseValidationModal}>
        <ModalNavigation title={t('item_editor.center_panel.validation_modal_title')} onClose={this.handleCloseValidationModal} />
        <Modal.Content>
          <ValidationIssuesPanel issues={validationIssues} collapsible={false} />
        </Modal.Content>
      </Modal>
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
    const { isShowingAvatarAttributes, showSceneBoundaries, isLoading, socialEmote } = this.state
    const isRenderingAnEmote = visibleItems.some(isEmote) && selectedItem?.type === ItemType.EMOTE
    const zoom = emote === PreviewEmote.JUMP ? 1 : undefined
    let _socialEmote: any = undefined

    if (!socialEmote && selectedItem?.type === ItemType.EMOTE && (selectedItem.data as unknown as EmoteData).startAnimation) {
      _socialEmote = { title: 'Start Animation', ...(selectedItem.data as unknown as EmoteData).startAnimation, loop: true }
    }

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
          socialEmote={socialEmote || _socialEmote}
          unity
          unityMode={PreviewUnityMode.BUILDER}
        />
        {isRenderingAnEmote && !isUnityWearablePreviewEnabled && !isLoading && wearableController ? (
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
            {!isUnityWearablePreviewEnabled && (
              <div className={`option scene-boundaries ${showSceneBoundaries ? 'active' : ''}`}>
                <BuilderIcon
                  name="cylinder"
                  onClick={() => this.setState(prevState => ({ showSceneBoundaries: !prevState.showSceneBoundaries }))}
                />
              </div>
            )}
            {this.renderValidationStatus()}
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
        {this.renderValidationModal()}
      </div>
    )
  }
}
