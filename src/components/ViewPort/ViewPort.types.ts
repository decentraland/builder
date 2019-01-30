import { Dispatch } from 'redux'
import { TogglePreviewAction, togglePreview } from 'modules/editor/actions'

export type Props = {
  isPreviewing: boolean
  onTogglePreview: typeof togglePreview
}

export type MapStateProps = Pick<Props, 'isPreviewing'>
export type MapDispatchProps = Pick<Props, 'onTogglePreview'>
export type MapDispatch = Dispatch<TogglePreviewAction>
