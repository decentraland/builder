import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Center, Dropdown, DropdownItemProps, DropdownProps, Field, Icon, Loader, Popup, Radio } from 'decentraland-ui'
import { BodyPartCategory, BodyShape, PreviewEmote, PreviewUnityMode, WearableCategory } from '@dcl/schemas'
import { WearablePreview } from 'decentraland-ui2'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isDevelopment } from 'lib/environment'
import {
  fetchBaseWearablesRequest,
  setBaseWearable,
  setBodyShape,
  setEmote,
  setEyeColor,
  setHairColor,
  setSkinColor,
  setWearablePreviewController
} from 'modules/editor/actions'
import {
  getBaseWearables,
  getBodyShape,
  getEmote,
  getEyeColor,
  getHairColor,
  getSelectedBaseWearablesByBodyShape,
  getSkinColor,
  getWearablePreviewController,
  isPlayingEmote as getIsPlayingEmote
} from 'modules/editor/selectors'
import { getRandomBaseWearables, pickRandom, toHex } from 'modules/editor/utils'
import { getEyeColors, getHairColors, getSkinColors } from 'modules/editor/avatar'
import { getHideableBodyPartCategories, getHideableWearableCategories, getWearableCategories } from 'modules/item/utils'
import Info from 'components/Info'
import Select from 'components/ItemEditorPage/RightPanel/Select'
import MultiSelect from 'components/ItemEditorPage/RightPanel/MultiSelect'
import AvatarColorDropdown from 'components/ItemEditorPage/CenterPanel/AvatarColorDropdown'
import AvatarWearableDropdown from 'components/ItemEditorPage/CenterPanel/AvatarWearableDropdown'
import {
  BridgeState,
  DEFAULT_BRIDGE_URL,
  LivePreviewStatus,
  MODEL_KEY,
  buildDefinition,
  fetchBridgeState,
  fetchModelBlob
} from './livePreview'

import 'components/ItemEditorPage/CenterPanel/CenterPanel.css'
import './LivePreviewPage.css'

const PREVIEW_ID = 'blender-live-preview'
const POLL_INTERVAL_MS = 1000
const BODY_SHAPES = [BodyShape.MALE, BodyShape.FEMALE]

/** The `bridge` query param carries the local bridge port (`?bridge=8081`) or a full URL. */
function getInitialBridgeUrl(): string {
  const param = new URLSearchParams(window.location.search).get('bridge')
  if (!param) return DEFAULT_BRIDGE_URL
  return /^\d+$/.test(param) ? `http://localhost:${param}` : param
}

function formatTimeAgo(timestamp: number): string {
  const elapsed = Date.now() - timestamp
  if (elapsed < 10_000) return 'now'
  const minutes = Math.max(1, Math.floor(elapsed / 60_000))
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'} ago`
}

function renderSelectTrigger(label: string, value: string) {
  return (
    <>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="handle" />
    </>
  )
}

export default function LivePreviewPage() {
  const dispatch = useDispatch()

  const [bridgeUrl, setBridgeUrl] = useState<string>(getInitialBridgeUrl)
  const [status, setStatus] = useState<LivePreviewStatus>(LivePreviewStatus.DISCONNECTED)
  const [error, setError] = useState<string | null>(null)
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null)
  const [glb, setGlb] = useState<Blob | null>(null)
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isShowingAvatarAttributes, setIsShowingAvatarAttributes] = useState(false)

  // Preview controls. A null category follows whatever the bridge reports until the user picks one.
  const [categoryOverride, setCategoryOverride] = useState<WearableCategory | null>(null)
  const [hidesWearable, setHidesWearable] = useState<WearableCategory[]>([])
  const [hidesBodyPart, setHidesBodyPart] = useState<BodyPartCategory[]>([])
  const [emoteLoop, setEmoteLoop] = useState<boolean>(true)

  // Avatar attributes live in the editor redux module so the CenterPanel dropdowns can be reused as-is.
  const bodyShape = useSelector(getBodyShape)
  const skinColor = useSelector(getSkinColor)
  const eyeColor = useSelector(getEyeColor)
  const hairColor = useSelector(getHairColor)
  const emote = useSelector(getEmote)
  const baseWearables = useSelector(getBaseWearables)
  const selectedBaseWearablesByBodyShape = useSelector(getSelectedBaseWearablesByBodyShape)
  const selectedBaseWearables = selectedBaseWearablesByBodyShape ? selectedBaseWearablesByBodyShape[bodyShape] : null
  const wearableController = useSelector(getWearablePreviewController)
  const isEmotePlaying = useSelector(getIsPlayingEmote)
  // The idle animation always loops: like the editor, don't treat it as a playing emote.
  const isPlaying = emote === PreviewEmote.IDLE ? false : isEmotePlaying

  // Kept in refs so the polling loop can read the latest values without re-subscribing.
  const isConnectedRef = useRef<boolean>(false)
  const lastVersionRef = useRef<BridgeState['version'] | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = useCallback(() => {
    isConnectedRef.current = false
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const disconnect = useCallback(() => {
    stopPolling()
    lastVersionRef.current = null
    setStatus(LivePreviewStatus.DISCONNECTED)
    setError(null)
  }, [stopPolling])

  // Single polling tick: read bridge state, and if the export changed, pull the fresh GLB. The
  // definition is derived below, and updating it makes <WearablePreview> fire an UPDATE
  // postMessage to the iframe — a hot-swap with no reload.
  const poll = useCallback(async () => {
    if (!isConnectedRef.current) return
    try {
      const state = await fetchBridgeState(bridgeUrl)
      setStatus(LivePreviewStatus.CONNECTED)
      setError(null)

      if (state.version !== lastVersionRef.current) {
        const model = await fetchModelBlob(bridgeUrl)
        lastVersionRef.current = state.version
        console.log(`[LivePreview] bridge pushed v${state.version} (${state.type ?? 'wearable'}, ${model.size} bytes)`)
        setBridgeState(state)
        setGlb(model)
        setLastUpdateAt(Date.now())
      }
    } catch (e) {
      setStatus(LivePreviewStatus.ERROR)
      setError(e instanceof Error ? e.message : 'Could not reach the Blender bridge')
    } finally {
      // Pause the loop while the tab is hidden: the visibility handler restarts it on return.
      if (isConnectedRef.current && !document.hidden) {
        timerRef.current = setTimeout(() => void poll(), POLL_INTERVAL_MS)
      }
    }
  }, [bridgeUrl])

  const connect = useCallback(() => {
    stopPolling()
    lastVersionRef.current = null
    isConnectedRef.current = true
    setStatus(LivePreviewStatus.CONNECTING)
    setError(null)
    void poll()
  }, [poll, stopPolling])

  const handleRefresh = useCallback(() => {
    if (!isConnectedRef.current) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    lastVersionRef.current = null
    void poll()
  }, [poll])

  // Auto-connect with the bridge from the URL, and load the base wearables catalog into redux
  // (its success handler also randomizes the avatar's base outfit, like the item editor).
  useEffect(() => {
    if (!selectedBaseWearablesByBodyShape) {
      dispatch(fetchBaseWearablesRequest())
    }
    connect()
    return () => {
      stopPolling()
      dispatch(setWearablePreviewController(null))
    }
  }, [])

  // Force a refresh whenever the user comes back to the tab. Polling pauses while the tab is
  // hidden (see poll), but keeps running while the window is merely unfocused: Blender
  // side-by-side with the browser is the main use case.
  useEffect(() => {
    const handleReturn = () => {
      if (!document.hidden) {
        handleRefresh()
      }
    }
    document.addEventListener('visibilitychange', handleReturn)
    window.addEventListener('focus', handleReturn)
    return () => {
      document.removeEventListener('visibilitychange', handleReturn)
      window.removeEventListener('focus', handleReturn)
    }
  }, [handleRefresh])

  // Re-render every few seconds so the relative "updated x ago" label stays fresh.
  const [, setTimeAgoTick] = useState(0)
  useEffect(() => {
    if (lastUpdateAt === null) return
    const interval = setInterval(() => setTimeAgoTick(tick => (tick + 1) % 10), 15000)
    return () => clearInterval(interval)
  }, [lastUpdateAt])

  const handleRandomizeAvatar = useCallback(() => {
    const shape = pickRandom(BODY_SHAPES)
    console.log(`[LivePreview] randomizing avatar (${shape}) — the iframe will reload and ask for the model again`)
    dispatch(setBodyShape(shape))
    dispatch(setSkinColor(pickRandom(getSkinColors())))
    dispatch(setEyeColor(pickRandom(getEyeColors())))
    dispatch(setHairColor(pickRandom(getHairColors())))
    if (selectedBaseWearablesByBodyShape) {
      for (const [category, wearable] of Object.entries(getRandomBaseWearables(baseWearables, shape))) {
        dispatch(setBaseWearable(category as WearableCategory, shape, wearable ?? null))
      }
    }
  }, [dispatch, baseWearables, selectedBaseWearablesByBodyShape])

  // Avatar props (urns, bodyShape, colors, emote) are part of the iframe URL, so changing any of
  // them reloads the iframe — and the blob, which only travels via postMessage, is gone on the
  // fresh page. Every boot posts `ready`, so bump a revision that rides inside the definition:
  // that makes the options deep-unequal and forces decentraland-ui2 to re-send the blob.
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'ready') return
      console.log('[LivePreview] preview iframe booted — re-delivering the model blob')
      setRevision(current => current + 1)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const definition = useMemo(() => {
    if (!bridgeState || !glb) return null
    return buildDefinition(bridgeState, glb, {
      category: categoryOverride ?? undefined,
      hides: [...hidesBodyPart, ...hidesWearable],
      loop: emoteLoop,
      revision
    })
  }, [bridgeState, glb, categoryOverride, hidesBodyPart, hidesWearable, emoteLoop, revision])

  const isEmote = definition?.isEmote ?? false
  const hasDefinition = !!definition

  useEffect(() => {
    if (hasDefinition) {
      setIsPreviewLoading(true)
    }
  }, [hasDefinition])

  const handlePreviewLoad = useCallback(() => {
    console.log('[LivePreview] preview loaded')
    // The controller lives in redux so the editor saga tracks the emote play/pause/end events
    // and keeps isPlayingEmote in sync, exactly like the item editor.
    if (!wearableController) {
      dispatch(setWearablePreviewController(WearablePreview.createController(PREVIEW_ID)))
    }
    setIsPreviewLoading(false)
  }, [dispatch, wearableController])

  const handlePlayEmote = useCallback(() => {
    if (isPlaying) {
      dispatch(setEmote(PreviewEmote.IDLE))
    } else {
      void wearableController?.emote.play()
    }
  }, [dispatch, isPlaying, wearableController])

  const handleAnimationChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownItemProps) => {
      dispatch(setEmote(value as PreviewEmote))
    },
    [dispatch]
  )

  const handleBodyShapeChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
      dispatch(setBodyShape(value as BodyShape))
    },
    [dispatch]
  )

  // The category helpers only inspect the file names, so advertise the model key even before
  // the first GLB arrives — otherwise they fall back to the image-only category set.
  const contents = useMemo(() => ({ [MODEL_KEY]: glb ?? new Blob() }), [glb])
  const category = categoryOverride ?? (bridgeState?.category as WearableCategory | undefined) ?? WearableCategory.HAT

  const categoryOptions = getWearableCategories(contents).map(value => ({ value, text: t(`wearable.category.${value}`) }))
  const hideableWearableOptions = getHideableWearableCategories(contents, category)
    .filter(value => value !== WearableCategory.BODY_SHAPE)
    .map(value => ({ value, text: t(`wearable.category.${value}`) }))
  const hideableBodyPartOptions = getHideableBodyPartCategories(contents).map(value => ({
    value,
    text: t(`wearable.category.${value}`)
  }))
  const bodyShapeOptions = [
    { value: BodyShape.MALE, text: t('body_shapes.male') },
    { value: BodyShape.FEMALE, text: t('body_shapes.female') }
  ]

  const urns = selectedBaseWearables
    ? Object.values(selectedBaseWearables)
        .map(wearable => (wearable ? wearable.id : null))
        .filter((urn): urn is string => urn !== null)
    : []

  const isConnected = status === LivePreviewStatus.CONNECTED || status === LivePreviewStatus.CONNECTING

  return (
    <div className="LivePreviewPage">
      <div className="live-content">
        <div className="live-panel">
          <div className="panel-section">
            <h1>
              Blender Live Preview
              <Info content="Connect to the local Blender bridge and preview a wearable or emote in real time. Every push from Blender hot-swaps the model without reloading." />
              <span
                className={`status-pill status--${status}`}
                title={error ?? (definition ? 'Model loaded' : 'Waiting for an export from Blender')}
              >
                {status === LivePreviewStatus.CONNECTED && 'Connected'}
                {status === LivePreviewStatus.CONNECTING && 'Connecting…'}
                {status === LivePreviewStatus.DISCONNECTED && 'Disconnected'}
                {status === LivePreviewStatus.ERROR && 'Error'}
              </span>
            </h1>
            <div className="connect-row">
              <Field
                label="Blender URL"
                value={bridgeUrl}
                disabled={isConnected}
                onChange={(_e, data) => setBridgeUrl(data.value)}
                placeholder={DEFAULT_BRIDGE_URL}
              />
              {isConnected ? (
                <Button compact onClick={disconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button compact primary onClick={connect}>
                  Connect
                </Button>
              )}
            </div>
            {isConnected && (
              <div className="actions">
                <Button icon onClick={handleRefresh}>
                  <Icon name="refresh" />
                  <span>Refresh</span>
                </Button>
                {lastUpdateAt !== null && (
                  <span className="last-update" title={new Date(lastUpdateAt).toLocaleTimeString()}>
                    Updated {formatTimeAgo(lastUpdateAt)}
                  </span>
                )}
              </div>
            )}
          </div>

          {isEmote ? (
            <div className="panel-section">
              <div className="section-title">
                Emote
                <Info content="The emote streamed from Blender plays automatically on the avatar." />
              </div>
              <Radio toggle label="Loop" checked={emoteLoop} onChange={(_e, data) => setEmoteLoop(!!data.checked)} />
            </div>
          ) : (
            <div className="panel-section">
              <div className="section-title">{t('item_editor.right_panel.properties')}</div>
              <Select<WearableCategory>
                itemId={PREVIEW_ID}
                label={t('global.category')}
                value={category}
                options={categoryOptions}
                onChange={setCategoryOverride}
              />
              <div className="section-title overrides">{t('item_editor.right_panel.overrides')}</div>
              <MultiSelect<BodyPartCategory>
                itemId={PREVIEW_ID}
                label={t('item_editor.right_panel.base_body')}
                info={t('item_editor.right_panel.base_body_info')}
                value={hidesBodyPart}
                options={hideableBodyPartOptions}
                onChange={setHidesBodyPart}
              />
              <MultiSelect<WearableCategory>
                itemId={PREVIEW_ID}
                label={t('item_editor.right_panel.wearables')}
                info={t('item_editor.right_panel.wearables_info')}
                value={hidesWearable}
                options={hideableWearableOptions}
                onChange={setHidesWearable}
              />
            </div>
          )}
        </div>

        <div className={`live-preview CenterPanel ${isPreviewLoading ? 'is-loading' : ''}`}>
          {definition ? (
            <WearablePreview
              id={PREVIEW_ID}
              profile="default"
              bodyShape={bodyShape}
              emote={isEmote ? undefined : emote}
              skin={toHex(skinColor)}
              eyes={toHex(eyeColor)}
              hair={toHex(hairColor)}
              urns={urns}
              blob={definition.blob}
              disableAutoRotate
              disableBackground
              disableDefaultEmotes={isEmote}
              wheelZoom={1.5}
              wheelStart={100}
              dev={isDevelopment}
              unity
              unityMode={PreviewUnityMode.BUILDER}
              onError={e => console.error('[LivePreview] preview error:', e.message)}
              onUpdate={() => setIsPreviewLoading(true)}
              onLoad={handlePreviewLoad}
            />
          ) : (
            <div className="live-placeholder">
              {status === LivePreviewStatus.CONNECTING ? <Loader active size="large" /> : <span>No model yet.</span>}
            </div>
          )}
          {definition && isPreviewLoading && (
            <Center>
              <Loader active />
            </Center>
          )}
          <div className="footer">
            <div className="options">
              <Popup
                content={t('item_editor.center_panel.customize_avatar')}
                position="top center"
                on="hover"
                inverted
                trigger={
                  <div
                    className={`option ${isShowingAvatarAttributes ? 'active' : ''}`}
                    onClick={() => setIsShowingAvatarAttributes(!isShowingAvatarAttributes)}
                  >
                    <Icon name="user" />
                  </div>
                }
              />
              <Popup
                content={t('item_editor.center_panel.randomize_avatar')}
                position="top center"
                on="hover"
                inverted
                trigger={
                  <div className="option randomize-avatar" onClick={handleRandomizeAvatar}>
                    <Icon name="random" />
                  </div>
                }
              />
              {!isEmote && (
                <div className="avatar-animation-dropdown-wrapper option">
                  <Button.Group>
                    <Button icon onClick={handlePlayEmote}>
                      <Icon name={isPlaying ? 'stop' : 'play'} />
                      <span>{isPlaying ? t('item_editor.center_panel.stop') : t('item_editor.center_panel.play_emote')}</span>
                    </Button>
                    {!isPlaying && (
                      <Dropdown className="avatar-animation button icon" floating scrolling>
                        <Dropdown.Menu>
                          {PreviewEmote.schema.enum.map((value: PreviewEmote) => (
                            <Dropdown.Item key={value} value={value} text={t(`emotes.${value}`)} onClick={handleAnimationChange} />
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </Button.Group>
                </div>
              )}
            </div>
            <div className={`avatar-attributes ${isShowingAvatarAttributes ? 'active' : ''}`}>
              <div className="dropdown-container">
                <Dropdown
                  inline
                  direction="right"
                  className="Select"
                  value={bodyShape}
                  options={bodyShapeOptions}
                  trigger={renderSelectTrigger(
                    t('wearable.category.body_shape'),
                    bodyShapeOptions.find(option => option.value === bodyShape)?.text ?? ''
                  )}
                  onChange={handleBodyShapeChange}
                />
              </div>
              <div className="dropdown-container">
                <AvatarColorDropdown
                  currentColor={skinColor}
                  colors={getSkinColors()}
                  label={t('wearable.color.skin')}
                  onChange={color => dispatch(setSkinColor(color))}
                />
              </div>
              <div className="dropdown-container">
                <AvatarColorDropdown
                  currentColor={eyeColor}
                  colors={getEyeColors()}
                  label={t('wearable.color.eye')}
                  onChange={color => dispatch(setEyeColor(color))}
                />
              </div>
              <div className="dropdown-container">
                <AvatarColorDropdown
                  currentColor={hairColor}
                  colors={getHairColors()}
                  label={t('wearable.color.hair')}
                  onChange={color => dispatch(setHairColor(color))}
                />
              </div>
              <div className="dropdown-container">
                {selectedBaseWearables && (
                  <AvatarWearableDropdown
                    wearable={selectedBaseWearables[WearableCategory.HAIR]}
                    category={WearableCategory.HAIR}
                    bodyShape={bodyShape}
                    label={t('wearable.category.hair')}
                    onChange={(category, shape, wearable) => dispatch(setBaseWearable(category, shape, wearable))}
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
                    onChange={(category, shape, wearable) => dispatch(setBaseWearable(category, shape, wearable))}
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
                    onChange={(category, shape, wearable) => dispatch(setBaseWearable(category, shape, wearable))}
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
                    onChange={(category, shape, wearable) => dispatch(setBaseWearable(category, shape, wearable))}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
