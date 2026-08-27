import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Center, Dropdown, DropdownItemProps, DropdownProps, Field, Icon, Loader, Popup, Radio } from 'decentraland-ui'
import { BodyPartCategory, BodyShape, EmoteCategory, PreviewEmote, PreviewUnityMode, WearableCategory } from '@dcl/schemas'
import { openModal } from 'decentraland-dapps/dist/modules/modal'
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
import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { getHideableBodyPartCategories, getHideableWearableCategories, getWearableCategories } from 'modules/item/utils'
import { parseSpringBones } from 'lib/parseSpringBones'
import { getDefaultSpringBoneParams, getDefaultSpringBoneRoots } from 'lib/springBones'
import { loadAndValidateModel, EngineType } from 'lib/getModelData'
import type { ValidationIssue } from 'lib/glbValidation/types'
import Info from 'components/Info'
import { SelectTrigger } from 'components/SelectTrigger'
import { ValidationStatusBadge } from 'components/ValidationStatusBadge'
import Select from 'components/ItemEditorPage/RightPanel/Select'
import MultiSelect from 'components/ItemEditorPage/RightPanel/MultiSelect'
import SpringBonesSection from 'components/ItemEditorPage/RightPanel/SpringBonesSection'
import AvatarColorDropdown from 'components/ItemEditorPage/CenterPanel/AvatarColorDropdown'
import AvatarWearableDropdown from 'components/ItemEditorPage/CenterPanel/AvatarWearableDropdown'
import {
  BridgeState,
  DEFAULT_BRIDGE_URL,
  LIVE_PREVIEW_ITEM_ID,
  LivePreviewStatus,
  MODEL_KEY,
  buildDefinition,
  fetchBridgeState,
  fetchModelBlob
} from './livePreview'

import 'components/ItemEditorPage/CenterPanel/CenterPanel.css'
import './LivePreviewPage.css'

const PREVIEW_ID = 'blender-live-preview'
const POLL_INTERVAL_MS = 1000 * 2
// While the bridge is unreachable, back off so a stopped bridge isn't hammered every 2s.
const ERROR_POLL_INTERVAL_MS = 1000 * 15
const BODY_SHAPES = [BodyShape.MALE, BodyShape.FEMALE]

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]']

/**
 * The `bridge` query param carries the local bridge port (`?bridge=8081`) or a full URL. Only
 * local origins are trusted: a crafted link must not point the page at an external server.
 */
function getInitialBridgeUrl(): string {
  const param = new URLSearchParams(window.location.search).get('bridge')
  if (!param) return DEFAULT_BRIDGE_URL
  if (/^\d+$/.test(param)) return `http://localhost:${param}`
  try {
    const url = new URL(param)
    if ((url.protocol === 'http:' || url.protocol === 'https:') && LOCAL_HOSTNAMES.includes(url.hostname)) {
      return param
    }
  } catch {
    // Not a valid URL: fall through to the default.
  }
  return DEFAULT_BRIDGE_URL
}

function formatTimeAgo(timestamp: number): string {
  const elapsed = Date.now() - timestamp
  if (elapsed < 5_000) return t('live_preview_page.time_ago.now')
  if (elapsed < 60_000) return t('live_preview_page.time_ago.moment')
  const minutes = Math.floor(elapsed / 60_000)
  if (minutes < 60) return t('live_preview_page.time_ago.minutes', { minutes })
  return t('live_preview_page.time_ago.hours', { hours: Math.floor(minutes / 60) })
}

/** Isolated so the periodic tick keeping the relative label fresh doesn't re-render the page. */
function TimeAgoLabel({ timestamp }: { timestamp: number }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick(tick => (tick + 1) % 10), 5000)
    return () => clearInterval(interval)
  }, [])
  return (
    <span className="last-update" title={new Date(timestamp).toLocaleTimeString()}>
      {t('live_preview_page.updated', { time_ago: formatTimeAgo(timestamp) })}
    </span>
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
  const [isRefreshing, setIsRefreshing] = useState(false)
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
  // Reentrant calls bail instead of forking a second setTimeout chain: refreshes can fire while a
  // tick is mid-fetch (tab return raises both visibilitychange and focus), and only the latest
  // chain's timer is tracked — an orphaned one would keep polling until disconnect.
  const isPollingRef = useRef(false)
  const poll = useCallback(async () => {
    if (!isConnectedRef.current || isPollingRef.current) return
    isPollingRef.current = true
    let interval = POLL_INTERVAL_MS
    try {
      const state = await fetchBridgeState(bridgeUrl)
      // Bail out after each await: a disconnect mid-flight must not overwrite the DISCONNECTED status.
      if (!isConnectedRef.current) return
      setStatus(LivePreviewStatus.CONNECTED)
      setError(null)

      if (state.version !== lastVersionRef.current) {
        const model = await fetchModelBlob(bridgeUrl)
        if (!isConnectedRef.current) return
        lastVersionRef.current = state.version
        setBridgeState(state)
        setGlb(model)
        setLastUpdateAt(Date.now())
      }
    } catch (e) {
      if (!isConnectedRef.current) return
      interval = ERROR_POLL_INTERVAL_MS
      setStatus(LivePreviewStatus.ERROR)
      setError(e instanceof Error ? e.message : t('live_preview_page.errors.unreachable'))
    } finally {
      isPollingRef.current = false
      // Pause the loop while the tab is hidden: the visibility handler restarts it on return.
      if (isConnectedRef.current && !document.hidden) {
        timerRef.current = setTimeout(() => void poll(), interval)
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

  const handleRefresh = useCallback(async () => {
    if (!isConnectedRef.current) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    lastVersionRef.current = null
    setIsRefreshing(true)
    try {
      await poll()
    } finally {
      setIsRefreshing(false)
    }
  }, [poll])

  // Auto-connect with the bridge from the URL, and load the base wearables catalog into redux
  // (its success handler also randomizes the avatar's base outfit, like the item editor).
  // Mount-only on purpose despite using `connect`/`stopPolling`: reconnecting is user-driven
  // through the Connect button, never a reaction to the bridge URL field changing.
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
        void handleRefresh()
      }
    }
    document.addEventListener('visibilitychange', handleReturn)
    window.addEventListener('focus', handleReturn)
    return () => {
      document.removeEventListener('visibilitychange', handleReturn)
      window.removeEventListener('focus', handleReturn)
    }
  }, [handleRefresh])

  const handleRandomizeAvatar = useCallback(() => {
    const shape = pickRandom(BODY_SHAPES)
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
      // Only trust the preview iframe: any window can post a `ready`-shaped message.
      const iframe = document.getElementById(PREVIEW_ID) as HTMLIFrameElement | null
      if (!iframe || event.source !== iframe.contentWindow) return
      setRevision(current => current + 1)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Spring bones are parsed from each streamed GLB, and their params live in local state:
  // unlike the item editor there is no item hash to key the redux state by, nothing to save.
  const [bones, setBones] = useState<BoneNode[]>([])
  const [springBoneParams, setSpringBoneParams] = useState<Record<string, SpringBoneParams>>({})
  const hasSpringBonesInGlb = useMemo(() => bones.some(bone => bone.type === 'spring'), [bones])
  const springBoneParamsRef = useRef(springBoneParams)
  springBoneParamsRef.current = springBoneParams
  // The definition id is versioned per push (see buildDefinition), and both renderers key their
  // spring bone registries by it, so physics calls must target the id currently loaded.
  const definitionIdRef = useRef<string>(LIVE_PREVIEW_ITEM_ID)
  // Bones the user explicitly removed, so a re-export from Blender doesn't re-seed them.
  const deletedSpringBonesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!glb) return
    let cancelled = false
    glb
      .arrayBuffer()
      .then(buffer => {
        if (cancelled) return
        const { bones } = parseSpringBones(buffer)
        setBones(bones)
        // Keep the params tuned on previous pushes, drop bones that disappeared from the export,
        // and seed defaults for new chain roots like the item editor does on upload.
        setSpringBoneParams(previous => {
          const springBoneNames = new Set(bones.filter(bone => bone.type === 'spring').map(bone => bone.name))
          const next: Record<string, SpringBoneParams> = {}
          for (const [name, params] of Object.entries(previous)) {
            if (springBoneNames.has(name)) next[name] = params
          }
          for (const [name, params] of Object.entries(getDefaultSpringBoneRoots(bones))) {
            if (!(name in next) && !deletedSpringBonesRef.current.has(name)) next[name] = params
          }
          return next
        })
      })
      .catch(e => console.warn('[LivePreview] failed to parse spring bones:', e))
    return () => {
      cancelled = true
    }
  }, [glb])

  const pushSpringBoneParams = useCallback(
    (controller = wearableController) => {
      if (!controller || !hasSpringBonesInGlb) return
      controller.physics
        .setSpringBonesParams(definitionIdRef.current, springBoneParamsRef.current)
        .catch(e => console.warn('[LivePreview] failed to push spring bone params:', e))
    },
    [wearableController, hasSpringBonesInGlb]
  )

  // Debounced push on param edits: slider drags fire onChange continuously.
  useEffect(() => {
    if (!wearableController || !hasSpringBonesInGlb) return
    const timer = setTimeout(() => pushSpringBoneParams(), 500)
    return () => clearTimeout(timer)
  }, [springBoneParams, wearableController, hasSpringBonesInGlb, pushSpringBoneParams])

  const handleSpringBoneParamChange = useCallback(
    (boneName: string, field: keyof SpringBoneParams, value: SpringBoneParams[keyof SpringBoneParams]) => {
      setSpringBoneParams(previous =>
        previous[boneName] ? { ...previous, [boneName]: { ...previous[boneName], [field]: value } } : previous
      )
    },
    []
  )

  const handleAddSpringBoneParams = useCallback((boneName: string) => {
    deletedSpringBonesRef.current.delete(boneName)
    setSpringBoneParams(previous => ({ ...previous, [boneName]: getDefaultSpringBoneParams() }))
  }, [])

  const handleDeleteSpringBoneParams = useCallback((boneName: string) => {
    deletedSpringBonesRef.current.add(boneName)
    setSpringBoneParams(previous => {
      const { [boneName]: _removed, ...rest } = previous
      return rest
    })
  }, [])

  const category = categoryOverride ?? (bridgeState?.category as WearableCategory | undefined) ?? WearableCategory.HAT
  const hides = useMemo(() => [...hidesBodyPart, ...hidesWearable], [hidesBodyPart, hidesWearable])

  const definition = useMemo(() => {
    if (!bridgeState || !glb) return null
    return buildDefinition(bridgeState, glb, {
      category: categoryOverride ?? undefined,
      hides,
      loop: emoteLoop,
      revision
    })
  }, [bridgeState, glb, categoryOverride, hides, emoteLoop, revision])
  useEffect(() => {
    definitionIdRef.current = definition?.blob.id ?? LIVE_PREVIEW_ITEM_ID
  }, [definition])

  // Mirror the editor's center panel: validate the streamed GLB, re-running on category/hides edits.
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[] | undefined>(undefined)
  const [isValidating, setIsValidating] = useState(false)
  const validationRunRef = useRef(0)
  useEffect(() => {
    if (!glb) return
    const runId = ++validationRunRef.current
    setIsValidating(true)
    setValidationIssues(undefined)
    const url = URL.createObjectURL(glb)
    loadAndValidateModel(url, { width: 1024, height: 1024, engine: EngineType.BABYLON }, category, undefined, hides)
      .then(({ validationResult }) => {
        if (validationRunRef.current === runId) setValidationIssues(validationResult.issues)
      })
      .catch(error => {
        console.error('[LivePreview] validation failed:', error)
        // On error, show an empty list so the icon doesn't stay as a spinner
        if (validationRunRef.current === runId) setValidationIssues([])
      })
      .finally(() => {
        URL.revokeObjectURL(url)
        if (validationRunRef.current === runId) setIsValidating(false)
      })
  }, [glb, category, hides])

  const isEmote = definition?.isEmote ?? false
  const hasDefinition = !!definition

  useEffect(() => {
    if (hasDefinition) {
      setIsPreviewLoading(true)
    }
  }, [hasDefinition])

  const handlePreviewLoad = useCallback(() => {
    // The controller lives in redux so the editor saga tracks the emote play/pause/end events
    // and keeps isPlayingEmote in sync, exactly like the item editor.
    let controller = wearableController
    if (!controller) {
      controller = WearablePreview.createController(PREVIEW_ID)
      dispatch(setWearablePreviewController(controller))
    }
    // A (re)loaded scene starts without spring bone chains, so re-push the current params.
    pushSpringBoneParams(controller)
    setIsPreviewLoading(false)
  }, [dispatch, wearableController, pushSpringBoneParams])

  const handlePlayEmote = useCallback(() => {
    if (isPlaying) {
      dispatch(setEmote(PreviewEmote.IDLE))
    } else {
      void wearableController?.emote.play()
      // Push spring bone params immediately on emote play start, like the item editor.
      pushSpringBoneParams()
    }
  }, [dispatch, isPlaying, wearableController, pushSpringBoneParams])

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

  const handleAddToCollection = useCallback(() => {
    if (!glb || !bridgeState) return
    // Snapshot the current model: pushes from Blender while the modals are open don't affect it.
    const file = new File([glb], MODEL_KEY, { type: 'model/gltf-binary' })
    dispatch(
      openModal('AddToCollectionModal', {
        file,
        prefill: {
          // The bridge always reports the same placeholder name: leave it for the user to complete.
          name: '',
          category: isEmote ? (bridgeState.category as EmoteCategory | undefined) : category,
          hides: isEmote ? undefined : hides,
          // Only hand over tuned params: when empty, the modal seeds defaults from the GLB as usual.
          springBoneParams: !isEmote && Object.keys(springBoneParams).length > 0 ? springBoneParams : undefined
        }
      })
    )
  }, [dispatch, glb, bridgeState, isEmote, category, hides, springBoneParams])

  // The category helpers only inspect the file names, so advertise the model key even before
  // the first GLB arrives — otherwise they fall back to the image-only category set.
  const contents = useMemo(() => ({ [MODEL_KEY]: glb ?? new Blob() }), [glb])

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
              {t('live_preview_page.title')}
              <Info content={t('live_preview_page.title_info')} />
              <span
                className={`status-pill status--${status}`}
                title={error ?? (definition ? t('live_preview_page.model_loaded') : t('live_preview_page.waiting_for_export'))}
              >
                {t(`live_preview_page.status.${status}`)}
              </span>
            </h1>
            <div className="connect-row">
              <Field
                label={t('live_preview_page.bridge_url')}
                value={bridgeUrl}
                disabled={isConnected}
                onChange={(_e, data) => setBridgeUrl(data.value)}
                placeholder={DEFAULT_BRIDGE_URL}
              />
              {isConnected ? (
                <Button compact onClick={disconnect}>
                  {t('live_preview_page.disconnect')}
                </Button>
              ) : (
                <Button compact primary onClick={connect}>
                  {t('live_preview_page.connect')}
                </Button>
              )}
            </div>
            {isConnected && (
              <div className="actions">
                <Button icon disabled={isRefreshing} onClick={() => void handleRefresh()}>
                  <Icon name="refresh" loading={isRefreshing} />
                  <span>{t('live_preview_page.refresh')}</span>
                </Button>
                {lastUpdateAt !== null && <TimeAgoLabel timestamp={lastUpdateAt} />}
              </div>
            )}
          </div>

          {isEmote ? (
            <div className="panel-section">
              <div className="section-title">
                {t('live_preview_page.emote')}
                <Info content={t('live_preview_page.emote_info')} />
              </div>
              <Radio toggle label={t('live_preview_page.loop')} checked={emoteLoop} onChange={(_e, data) => setEmoteLoop(!!data.checked)} />
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

          {!isEmote && hasSpringBonesInGlb && (
            <div className="panel-section">
              <SpringBonesSection
                bones={bones}
                springBoneParams={springBoneParams}
                onParamChange={handleSpringBoneParamChange}
                onAddSpringBoneParams={handleAddSpringBoneParams}
                onDeleteSpringBoneParams={handleDeleteSpringBoneParams}
                hasSpringBonesInGlb={hasSpringBonesInGlb}
              />
            </div>
          )}

          <div className="panel-footer">
            <Button primary fluid disabled={!hasDefinition} onClick={handleAddToCollection}>
              {t('live_preview_page.add_to_collection')}
            </Button>
          </div>
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
              {status === LivePreviewStatus.CONNECTING ? <Loader active size="large" /> : <span>{t('live_preview_page.no_model')}</span>}
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
              {glb && <ValidationStatusBadge issues={validationIssues} isWaiting={isValidating || validationIssues === undefined} />}
            </div>
            <div className={`avatar-attributes ${isShowingAvatarAttributes ? 'active' : ''}`}>
              <div className="dropdown-container">
                <Dropdown
                  inline
                  direction="right"
                  className="Select"
                  value={bodyShape}
                  options={bodyShapeOptions}
                  trigger={
                    <SelectTrigger
                      label={t('wearable.category.body_shape')}
                      value={bodyShapeOptions.find(option => option.value === bodyShape)?.text ?? ''}
                    />
                  }
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
