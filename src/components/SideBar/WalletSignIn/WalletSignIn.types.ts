import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'

export type Props = SignInProps & {
  hasTranslations?: boolean
}

export type State = {
  hasError: boolean
}

export type MapStateProps = Pick<Props, 'isConnecting' | 'hasError'>

export type MapDispatchProps = Pick<Props, 'onConnect'>

export type MapDispatch = Dispatch
