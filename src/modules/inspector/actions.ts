import { action } from 'typesafe-actions'
import type { IframeStorage } from '@dcl/inspector'

export const OPEN_INSPECTOR = 'Open Inspector'
export const openInspector = () => action(OPEN_INSPECTOR)
export type OpenInspectorAction = ReturnType<typeof openInspector>

export const CONNECT_INSPECTOR = 'Connect Inspector'
export const connectInspector = (iframeId: string) => action(CONNECT_INSPECTOR, { iframeId })
export type ConnectInspectorAction = ReturnType<typeof connectInspector>

export const RPC_REQUEST = '[Request] RPC'
export const rpcRequest = (method: `${IframeStorage.Method}`, params: IframeStorage.Params[IframeStorage.Method], nonce: number) =>
  action(RPC_REQUEST, { method, params, nonce })
export type RPCRequestAction = ReturnType<typeof rpcRequest>

export const RPC_SUCCESS = '[Success] RPC'
export const rpcSuccess = (method: `${IframeStorage.Method}`, result: IframeStorage.Result[IframeStorage.Method], nonce: number) =>
  action(RPC_SUCCESS, { method, result, nonce })
export type RPCSuccessAction = ReturnType<typeof rpcSuccess>

export const RPC_FAILURE = '[Failure] RPC'
export const rpcFailure = (
  method: `${IframeStorage.Method}`,
  params: IframeStorage.Params[IframeStorage.Method],
  error: string,
  nonce: number
) => action(RPC_FAILURE, { method, params, error, nonce })
export type RPCFailureAction = ReturnType<typeof rpcFailure>

export const TOGGLE_SCREENSHOT = 'Toggle Screenshot'
export const toggleScreenshot = (enabled: boolean) => action(TOGGLE_SCREENSHOT, { enabled })
export type ToggleScreenshotAction = ReturnType<typeof toggleScreenshot>

export const SET_INSPECTOR_RELOADING = 'Set Inspector Reloading'
export const setInspectorReloading = (value: boolean) => action(SET_INSPECTOR_RELOADING, { value })
export type SetInspectorReloadingAction = ReturnType<typeof setInspectorReloading>
