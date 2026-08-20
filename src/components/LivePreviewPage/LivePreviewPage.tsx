import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Field, Icon, Loader, Radio } from 'decentraland-ui'
import { BodyPartCategory, BodyShape, PreviewEmote, PreviewUnityMode, WearableCategory } from '@dcl/schemas'
import { WearablePreview } from 'decentraland-ui2'
import type { Wearable } from 'decentraland-ecs'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isDevelopment } from 'lib/environment'
import { PEER_URL } from 'lib/api/peer'
import { Color4 } from 'lib/colors'
import { CatalystWearable } from 'modules/editor/types'
import { filterWearables, fromCatalystWearableToWearable, pickRandom, toHex } from 'modules/editor/utils'
import { getEyeColors, getHairColors, getSkinColors } from 'modules/editor/avatar'
import { getHideableBodyPartCategories, getHideableWearableCategories, getWearableCategories } from 'modules/item/utils'
import Navbar from 'components/Navbar'
import Select from 'components/ItemEditorPage/RightPanel/Select'
import MultiSelect from 'components/ItemEditorPage/RightPanel/MultiSelect'
import {
  BridgeState,
  DEFAULT_BRIDGE_URL,
  DEFAULT_PREVIEW_EMOTE,
  LivePreviewStatus,
  MODEL_KEY,
  buildDefinition,
  fetchBridgeState,
  fetchModelBlob
} from './livePreview'

import './LivePreviewPage.css'

const PREVIEW_ID = 'blender-live-preview'
const POLL_INTERVAL_MS = 1000
const BODY_SHAPES = [BodyShape.MALE, BodyShape.FEMALE]
// The deployed wearable-preview builds don't handle blob updates yet (a recent fix on its
// master does), so the renderer deployment is a visible, overridable setting — a locally
// served build (http://localhost:4444) works too.
const DEFAULT_PREVIEW_URL = 'https://wearable-preview.decentraland.zone'

type BaseWearableSelection = Record<BodyShape, Record<string, Wearable | null>>

/** Same categories the item editor randomizes when it initializes the avatar. */
function randomBaseSelection(wearables: Wearable[]): BaseWearableSelection {
  return {
    [BodyShape.FEMALE]: {
      [WearableCategory.HAIR]: pickRandom(filterWearables(wearables, WearableCategory.HAIR, BodyShape.FEMALE)),
      [WearableCategory.FACIAL_HAIR]: null,
      [WearableCategory.UPPER_BODY]: pickRandom(filterWearables(wearables, WearableCategory.UPPER_BODY, BodyShape.FEMALE)),
      [WearableCategory.LOWER_BODY]: pickRandom(filterWearables(wearables, WearableCategory.LOWER_BODY, BodyShape.FEMALE))
    },
    [BodyShape.MALE]: {
      [WearableCategory.HAIR]: pickRandom(filterWearables(wearables, WearableCategory.HAIR, BodyShape.MALE)),
      [WearableCategory.FACIAL_HAIR]: pickRandom(filterWearables(wearables, WearableCategory.FACIAL_HAIR, BodyShape.MALE)),
      [WearableCategory.UPPER_BODY]: pickRandom(filterWearables(wearables, WearableCategory.UPPER_BODY, BodyShape.MALE)),
      [WearableCategory.LOWER_BODY]: pickRandom(filterWearables(wearables, WearableCategory.LOWER_BODY, BodyShape.MALE))
    }
  }
}

export default function LivePreviewPage() {
  const [bridgeUrl, setBridgeUrl] = useState<string>(DEFAULT_BRIDGE_URL)
  const [previewUrl, setPreviewUrl] = useState<string>(DEFAULT_PREVIEW_URL)
  const [status, setStatus] = useState<LivePreviewStatus>(LivePreviewStatus.DISCONNECTED)
  const [error, setError] = useState<string | null>(null)
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null)
  const [glb, setGlb] = useState<Blob | null>(null)

  // Preview controls. A null category follows whatever the bridge reports until the user picks one.
  const [categoryOverride, setCategoryOverride] = useState<WearableCategory | null>(null)
  const [hidesWearable, setHidesWearable] = useState<WearableCategory[]>([])
  const [hidesBodyPart, setHidesBodyPart] = useState<BodyPartCategory[]>([])
  const [emote, setEmote] = useState<PreviewEmote>(DEFAULT_PREVIEW_EMOTE)
  const [emoteLoop, setEmoteLoop] = useState<boolean>(true)

  // Avatar attributes, randomized like the item editor does on init.
  const [bodyShape, setBodyShape] = useState<BodyShape>(() => pickRandom(BODY_SHAPES))
  const [skinColor, setSkinColor] = useState<Color4>(() => pickRandom(getSkinColors()))
  const [eyeColor, setEyeColor] = useState<Color4>(() => pickRandom(getEyeColors()))
  const [hairColor, setHairColor] = useState<Color4>(() => pickRandom(getHairColors()))
  const [baseWearables, setBaseWearables] = useState<Wearable[] | null>(null)
  const [selectedBase, setSelectedBase] = useState<BaseWearableSelection | null>(null)

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
        setBridgeState(state)
        setGlb(model)
      }
    } catch (e) {
      setStatus(LivePreviewStatus.ERROR)
      setError(e instanceof Error ? e.message : 'Could not reach the Blender bridge')
    } finally {
      if (isConnectedRef.current) {
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

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  // Base avatar wearables catalog, fetched the same way the editor saga does.
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await fetch(`${PEER_URL}/lambdas/collections/wearables?collectionId=urn:decentraland:off-chain:base-avatars`)
        if (!response.ok) {
          throw new Error('Failed to fetch base wearables')
        }
        const json: { wearables: CatalystWearable[] } = await response.json()
        // Drop base wearables that hide or replace others, preventing issues with the previewed item
        const wearables = json.wearables
          .filter(wearable => !wearable.data.hides?.length && !wearable.data.replaces?.length)
          .map(fromCatalystWearableToWearable)
        if (!cancelled) {
          setBaseWearables(wearables)
          setSelectedBase(randomBaseSelection(wearables))
        }
      } catch {
        // The catalog is cosmetic: without it the preview simply keeps the default avatar outfit.
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleRandomizeAvatar = useCallback(() => {
    setBodyShape(pickRandom(BODY_SHAPES))
    setSkinColor(pickRandom(getSkinColors()))
    setEyeColor(pickRandom(getEyeColors()))
    setHairColor(pickRandom(getHairColors()))
    if (baseWearables) {
      setSelectedBase(randomBaseSelection(baseWearables))
    }
  }, [baseWearables])

  const definition = useMemo(() => {
    if (!bridgeState || !glb) return null
    return buildDefinition(bridgeState, glb, {
      category: categoryOverride ?? undefined,
      hides: [...hidesBodyPart, ...hidesWearable],
      loop: emoteLoop
    })
  }, [bridgeState, glb, categoryOverride, hidesBodyPart, hidesWearable, emoteLoop])

  const isEmote = definition?.isEmote ?? false

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
  const emoteOptions = (PreviewEmote.schema.enum as PreviewEmote[]).map(value => ({ value, text: t(`emotes.${value}`) }))
  const bodyShapeOptions = [
    { value: BodyShape.MALE, text: t('body_shapes.male') },
    { value: BodyShape.FEMALE, text: t('body_shapes.female') }
  ]

  const urns = selectedBase
    ? Object.values(selectedBase[bodyShape])
        .map(wearable => (wearable ? wearable.id : null))
        .filter((urn): urn is string => urn !== null)
    : []

  const isConnected = status === LivePreviewStatus.CONNECTED || status === LivePreviewStatus.CONNECTING

  return (
    <div className="LivePreviewPage">
      <Navbar />
      <div className="live-content">
        <div className="live-panel">
          <div className="panel-section">
            <h1>Blender Live Preview</h1>
            <p className="description">
              Connect to the local Blender bridge and preview a wearable or emote in real time. Every push from Blender hot-swaps the model
              without reloading.
            </p>
            <Field
              label="Bridge URL"
              value={bridgeUrl}
              disabled={isConnected}
              onChange={(_e, data) => setBridgeUrl(data.value)}
              placeholder={DEFAULT_BRIDGE_URL}
            />
            <Field
              label="Preview URL"
              value={previewUrl}
              onChange={(_e, data) => setPreviewUrl(data.value)}
              placeholder={DEFAULT_PREVIEW_URL}
            />
            <div className="actions">
              {isConnected ? (
                <Button onClick={disconnect}>Disconnect</Button>
              ) : (
                <Button primary onClick={connect}>
                  Connect
                </Button>
              )}
              <span className={`status status--${status}`}>
                {status === LivePreviewStatus.CONNECTED && (definition ? 'Connected · model loaded' : 'Connected · waiting for export')}
                {status === LivePreviewStatus.CONNECTING && 'Connecting…'}
                {status === LivePreviewStatus.DISCONNECTED && 'Disconnected'}
                {status === LivePreviewStatus.ERROR && (error || 'Error')}
              </span>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">Preview</div>
            <div className="actions">
              <Button icon labelPosition="left" disabled={!isConnected} onClick={handleRefresh}>
                <Icon name="refresh" />
                Refresh
              </Button>
              <Button icon labelPosition="left" onClick={handleRandomizeAvatar}>
                <Icon name="random" />
                Random avatar
              </Button>
            </div>
            <Select<BodyShape>
              itemId={PREVIEW_ID}
              label={t('wearable.category.body_shape')}
              value={bodyShape}
              options={bodyShapeOptions}
              onChange={setBodyShape}
            />
            {!isEmote && (
              <Select<PreviewEmote>
                itemId={PREVIEW_ID}
                label={t('item_editor.center_panel.play_emote')}
                value={emote}
                options={emoteOptions}
                onChange={setEmote}
              />
            )}
          </div>

          {isEmote ? (
            <div className="panel-section">
              <div className="section-title">Emote</div>
              <p className="description">The emote streamed from Blender plays automatically on the avatar.</p>
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

        <div className="live-preview">
          {definition ? (
            <WearablePreview
              id={PREVIEW_ID}
              baseUrl={previewUrl.trim().replace(/\/$/, '') || DEFAULT_PREVIEW_URL}
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
              unity={false}
              unityMode={PreviewUnityMode.BUILDER}
              onError={e => console.error('[LivePreview] preview error:', e.message)}
              onLoad={() => console.log('[LivePreview] preview loaded')}
            />
          ) : (
            <div className="live-placeholder">
              {status === LivePreviewStatus.CONNECTING ? <Loader active size="large" /> : <span>No model yet.</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
