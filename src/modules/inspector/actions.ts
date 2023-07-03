import { action } from 'typesafe-actions'

export const OPEN_INSPECTOR = 'Open Inspector'
export const openInspector = () => action(OPEN_INSPECTOR)
export type OpenInspectorAction = ReturnType<typeof openInspector>
