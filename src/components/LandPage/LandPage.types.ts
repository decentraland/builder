import { Dispatch } from 'redux'
import { Land } from 'modules/land/types'
import { LandPageView } from 'modules/ui/land/types'
import { setLandPageView, SetLandPageViewAction } from 'modules/ui/land/actions'

export type Props = {
  lands: Land[]
  view: LandPageView
  isLoading: boolean
  onSetView: typeof setLandPageView
}

export type State = {
  showOwner: boolean
  showOperator: boolean
  showLessor: boolean
  showTenant: boolean
  page: number
  selectedLand: number
}

export type MapStateProps = Pick<Props, 'lands' | 'view' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSetView'>
export type MapDispatch = Dispatch<SetLandPageViewAction>
