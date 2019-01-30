import { Dispatch } from 'redux'
import { TogglePreviewAction, togglePreview } from 'modules/editor/actions'

export type Props = {
  isPreviewing: boolean
  onClosePreview: () => ReturnType<typeof togglePreview>
}

export type MapStateProps = Pick<Props, 'isPreviewing'>
export type MapDispatchProps = Pick<Props, 'onClosePreview'>
export type MapDispatch = Dispatch<TogglePreviewAction>
