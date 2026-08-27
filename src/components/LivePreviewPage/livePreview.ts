import {
  BodyPartCategory,
  BodyShape,
  EmoteCategory,
  EmoteWithBlobs,
  Locale,
  PreviewEmote,
  WearableCategory,
  WearableWithBlobs
} from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

/**
 * Live preview connector between a local Blender bridge and the WearablePreview iframe.
 *
 * The Blender add-on ("dcl-blender-toolkit") exposes a tiny local HTTP server that, on every
 * "Push to Preview" click, serves:
 *   - GET  <bridge>/state    -> JSON metadata { version, type, name, category, bodyShapes }
 *   - GET  <bridge>/model.glb -> the exported .glb binary
 *
 * This module polls <bridge>/state, and whenever `version` changes it fetches the fresh GLB as a
 * Blob and builds a `WearableWithBlobs` / `EmoteWithBlobs` definition. Feeding that object into the
 * <WearablePreview blob={...} /> prop makes the component diff its props and fire a `postMessage`
 * UPDATE to the iframe, hot-swapping the model with no iframe reload and nothing uploaded to
 * builder-server.
 */

export const DEFAULT_BRIDGE_URL = 'http://localhost:8080'

export enum LivePreviewStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export type BridgeState = {
  /** Monotonically increasing token; bumps every time the creator pushes a new export from Blender. */
  version: number | string
  /** Whether the pushed asset is a wearable or an emote. */
  type?: 'wearable' | 'emote'
  name?: string
  /** Wearable or emote category, e.g. "hat", "upper_body", "dance". */
  category?: string
  /** Body shapes the representation targets. Defaults to both when omitted. */
  bodyShapes?: BodyShape[]
}

export const MODEL_KEY = 'model.glb'
/** Base of the definition id fed to the preview; buildDefinition appends the version/revision. */
export const LIVE_PREVIEW_ITEM_ID = 'live-preview'
const BOTH_BODY_SHAPES = [BodyShape.MALE, BodyShape.FEMALE]

/** Panel-driven tweaks applied on top of whatever the bridge reports. */
export type DefinitionOverrides = {
  category?: WearableCategory
  hides?: (WearableCategory | BodyPartCategory)[]
  loop?: boolean
  /**
   * Bumped every time the preview iframe boots (posts `ready`). Avatar props like urns or
   * bodyShape are part of the iframe URL, so changing them reloads the iframe — and the blob,
   * which only travels via postMessage, is lost on the other side. Baking the revision into the
   * definition makes the next options object deep-unequal, forcing decentraland-ui2 to re-send it.
   */
  revision?: number
}

function isEmoteCategory(category?: string): boolean {
  if (!category) return false
  return (EmoteCategory.schema.enum as string[]).includes(category)
}

/** Fetch the current bridge metadata. Throws if the bridge is unreachable. */
export async function fetchBridgeState(bridgeUrl: string): Promise<BridgeState> {
  const response = await fetch(`${bridgeUrl.replace(/\/$/, '')}/state`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(t('live_preview_page.errors.bridge_response', { status: response.status }))
  }
  return (await response.json()) as BridgeState
}

/** Fetch the latest exported GLB from the bridge as a Blob. */
export async function fetchModelBlob(bridgeUrl: string): Promise<Blob> {
  const response = await fetch(`${bridgeUrl.replace(/\/$/, '')}/${MODEL_KEY}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(t('live_preview_page.errors.model_fetch', { status: response.status }))
  }
  return response.blob()
}

/**
 * Build a minimal definition-with-blobs from a raw GLB blob so it can be fed directly to
 * <WearablePreview blob={...} />. No URLs, no uploads: the GLB rides along as a Blob.
 */
export function buildDefinition(
  state: BridgeState,
  glb: Blob,
  overrides: DefinitionOverrides = {}
): { blob: WearableWithBlobs | EmoteWithBlobs; isEmote: boolean } {
  const bodyShapes = state.bodyShapes && state.bodyShapes.length > 0 ? state.bodyShapes : BOTH_BODY_SHAPES
  const name = state.name || 'Live preview'
  const isEmote = state.type === 'emote' || isEmoteCategory(state.category)
  const category = isEmote ? state.category : overrides.category ?? state.category

  const base = {
    // The version and revision ride in the id so every push looks like a brand-new item. Two
    // consumers depend on it changing: decentraland-ui2 deep-equals successive updates (two
    // different Blobs compare as equal empty objects, so only a changing field gets the UPDATE
    // through), and the Unity renderer caches loaded models by this id (as the entity URN) —
    // with a constant id it would keep the first GLB forever.
    id: `${LIVE_PREVIEW_ITEM_ID}-${String(state.version)}-${overrides.revision ?? 0}`,
    name,
    description: 'Live preview streamed from Blender',
    thumbnail: '',
    image: '',
    i18n: [{ code: Locale.EN, text: name }]
  }

  const representationContents = [{ key: MODEL_KEY, blob: glb }]

  if (isEmote) {
    const emote: EmoteWithBlobs = {
      ...base,
      emoteDataADR74: {
        category: (category as EmoteCategory) || EmoteCategory.DANCE,
        representations: [
          {
            bodyShapes,
            mainFile: MODEL_KEY,
            contents: representationContents
          }
        ],
        tags: [],
        loop: overrides.loop ?? false
      }
    }
    return { blob: emote, isEmote: true }
  }

  const wearable: WearableWithBlobs = {
    ...base,
    data: {
      category: (category as WearableCategory) || WearableCategory.HAT,
      hides: overrides.hides ?? [],
      replaces: [],
      tags: [],
      representations: [
        {
          bodyShapes,
          mainFile: MODEL_KEY,
          contents: representationContents,
          // The editor keeps overrideHides in sync with hides (see RightPanel.setHides).
          overrideHides: overrides.hides ?? [],
          overrideReplaces: []
        }
      ]
    }
  }
  return { blob: wearable, isEmote: false }
}

export const DEFAULT_PREVIEW_EMOTE = PreviewEmote.IDLE
