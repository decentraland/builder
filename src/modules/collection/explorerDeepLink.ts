import { Env } from '@dcl/ui-env'
import { config } from 'config'

type ExplorerDeepLinkOptions = {
  collectionId: string
  position?: { x: number; y: number }
  /** Detection window in ms (window focus loss → assume desktop client took over). */
  timeoutMs?: number
}

/**
 * Decentraland environment string forwarded as the `dclenv` deep-link arg so the desktop client
 * resolves the matching Builder API host (e.g. `builder-api.decentraland.{zone|today|org}`).
 * Mirrors the env split that `getExplorerURL` already encodes for the /play fallback URL.
 */
function resolveDclEnv(): 'zone' | 'today' | 'org' {
  if (config.is(Env.DEVELOPMENT)) return 'zone'
  if (config.is(Env.STAGING)) return 'today'
  return 'org'
}

/**
 * Builds a `decentraland://` deep link that opens the desktop explorer with the unreleased
 * Builder collection injected. Only resolves on a COLD start of the desktop client — the
 * runtime deep-link handler ignores `self-preview-builder-collections` and re-loading the same
 * client process won't pick it up. The signed fetch against the Builder API happens inside the
 * client using the logged-in wallet, so the wallet must own or be whitelisted on the collection.
 */
function buildExplorerDeepLink({ collectionId, position }: { collectionId: string; position?: { x: number; y: number } }): string {
  const params = new URLSearchParams()
  params.set('self-preview-builder-collections', collectionId)
  params.set('dclenv', resolveDclEnv())
  if (position) params.set('position', `${position.x},${position.y}`)
  return `decentraland://?${params.toString()}`
}

type WindowWithProcess = Window & { process?: { type?: string } }

function isElectronApp(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as WindowWithProcess
  if (typeof w.process === 'object' && w.process?.type === 'renderer') return true
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.includes('Electron')) return true
  return false
}

/**
 * Attempts to open the desktop explorer with the given Builder collection injected. Resolves:
 *  - `true` when the browser tab loses focus/visibility within `timeoutMs` (best-effort proxy for
 *    "the OS routed the decentraland:// scheme to an installed handler").
 *  - `false` when no focus loss is detected (likely not installed) or the env is mobile/Electron.
 *
 * IMPORTANT: must be invoked synchronously inside a user gesture (click handler) so the browser
 * allows the protocol navigation. Replicates the detection pattern used by `launchDesktopApp` in
 * `decentraland-ui2/src/modules/jumpIn.ts`, kept builder-local because the
 * `self-preview-builder-collections` arg is builder-specific and shouldn't leak into the shared
 * ui2 API surface.
 */
export function launchExplorerForCollection(opts: ExplorerDeepLinkOptions): Promise<boolean> {
  const { timeoutMs = 750 } = opts

  if (typeof window === 'undefined' || isElectronApp()) {
    return Promise.resolve(false)
  }

  const target = buildExplorerDeepLink(opts)
  let opened = false

  const onLoseFocus = () => {
    opened = true
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') onLoseFocus()
  }

  const cleanup = () => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('pagehide', onLoseFocus)
    window.removeEventListener('blur', onLoseFocus)
  }

  document.addEventListener('visibilitychange', onVisibilityChange, { passive: true })
  window.addEventListener('pagehide', onLoseFocus, { passive: true })
  window.addEventListener('blur', onLoseFocus, { passive: true })

  try {
    window.location.assign(target)
  } catch {
    cleanup()
    return Promise.resolve(false)
  }

  return new Promise<boolean>(resolve => {
    const t = setTimeout(() => {
      cleanup()
      resolve(opened)
    }, timeoutMs)

    if (opened) {
      clearTimeout(t)
      cleanup()
      resolve(true)
    }
  })
}

export { buildExplorerDeepLink, resolveDclEnv }
