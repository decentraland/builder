import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Field, Loader } from 'decentraland-ui'
import { EmoteWithBlobs, PreviewUnityMode, WearableWithBlobs } from '@dcl/schemas'
import { WearablePreview } from 'decentraland-ui2'
import { isDevelopment } from 'lib/environment'
import Navbar from 'components/Navbar'
import {
  BridgeState,
  DEFAULT_BRIDGE_URL,
  DEFAULT_PREVIEW_EMOTE,
  LivePreviewStatus,
  buildDefinition,
  fetchBridgeState,
  fetchModelBlob
} from './livePreview'

import './TestPage.css'

const PREVIEW_ID = 'live-preview'
const POLL_INTERVAL_MS = 1000

export default function TestPage() {
  const [bridgeUrl, setBridgeUrl] = useState<string>(DEFAULT_BRIDGE_URL)
  const [status, setStatus] = useState<LivePreviewStatus>(LivePreviewStatus.DISCONNECTED)
  const [error, setError] = useState<string | null>(null)
  const [blob, setBlob] = useState<WearableWithBlobs | EmoteWithBlobs | undefined>(undefined)
  const [isEmote, setIsEmote] = useState<boolean>(false)

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

  // Single polling tick: read bridge state, and if the export changed, pull the fresh GLB and
  // rebuild the definition. Setting `blob` re-renders <WearablePreview>, which diffs its props and
  // fires an UPDATE postMessage to the iframe — a hot-swap with no reload.
  const poll = useCallback(async () => {
    if (!isConnectedRef.current) return
    try {
      const state = await fetchBridgeState(bridgeUrl)
      setStatus(LivePreviewStatus.CONNECTED)
      setError(null)

      if (state.version !== lastVersionRef.current) {
        const glb = await fetchModelBlob(bridgeUrl)
        const { blob: definition, isEmote: emote } = buildDefinition(state, glb)
        lastVersionRef.current = state.version
        setIsEmote(emote)
        setBlob(definition)
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

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const isConnected = status === LivePreviewStatus.CONNECTED || status === LivePreviewStatus.CONNECTING

  return (
    <div className="TestPage">
      <Navbar />
      <div className="test-content">
        <div className="test-controls">
          <h1>Blender Live Preview</h1>
          <p className="test-description">
            Connect to a local Blender bridge and preview a wearable or emote in real time. Every "Push to Preview" in Blender hot-swaps the
            model below without re-importing anything.
          </p>
          <Field
            label="Bridge URL"
            value={bridgeUrl}
            disabled={isConnected}
            onChange={(_e, data) => setBridgeUrl(data.value)}
            placeholder={DEFAULT_BRIDGE_URL}
          />
          <div className="test-actions">
            {isConnected ? (
              <Button onClick={disconnect}>Disconnect</Button>
            ) : (
              <Button primary onClick={connect}>
                Connect
              </Button>
            )}
            <span className={`test-status test-status--${status}`}>
              {status === LivePreviewStatus.CONNECTED && (blob ? 'Connected · model loaded' : 'Connected · waiting for export')}
              {status === LivePreviewStatus.CONNECTING && 'Connecting…'}
              {status === LivePreviewStatus.DISCONNECTED && 'Disconnected'}
              {status === LivePreviewStatus.ERROR && (error || 'Error')}
            </span>
          </div>
        </div>

        <div className="test-preview">
          {blob ? (
            <WearablePreview
              id={PREVIEW_ID}
              profile="default"
              blob={blob}
              emote={isEmote ? DEFAULT_PREVIEW_EMOTE : undefined}
              disableAutoRotate
              disableBackground
              disableDefaultEmotes={isEmote}
              wheelZoom={1.5}
              wheelStart={100}
              dev={isDevelopment}
              unity={false}
              unityMode={PreviewUnityMode.BUILDER}
            />
          ) : (
            <div className="test-placeholder">
              {status === LivePreviewStatus.CONNECTING ? <Loader active size="large" /> : <span>No model yet.</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
