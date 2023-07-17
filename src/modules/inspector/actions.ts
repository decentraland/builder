import { action } from 'typesafe-actions'

export const OPEN_INSPECTOR = 'Open Inspector'
export const openInspector = () => action(OPEN_INSPECTOR)
export type OpenInspectorAction = ReturnType<typeof openInspector>

export const CONNECT_INSPECTOR = 'Connect Inspector'
export const connectInspector = (iframeId: string) => action(CONNECT_INSPECTOR, { iframeId })
export type ConnectInspectorAction = ReturnType<typeof connectInspector>
