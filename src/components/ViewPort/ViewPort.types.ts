import { Dispatch } from 'redux'
import { TogglePreviewAction, togglePreview } from 'modules/editor/actions'
import { OpenEditorOptions } from 'modules/editor/types'

export type Props = Partial<OpenEditorOptions> & {
  isPreviewing: boolean
  onClosePreview: () => ReturnType<typeof togglePreview>
}

export type MapStateProps = Pick<Props, 'isPreviewing'>
export type MapDispatchProps = Pick<Props, 'onClosePreview'>
export type MapDispatch = Dispatch<TogglePreviewAction>
