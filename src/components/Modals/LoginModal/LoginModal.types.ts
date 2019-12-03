import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  title?: string
  subtitle?: string
  callToAction?: string
  returnUrl?: string
  onLogin?: (params: OnLogingParams) => void
}

export type State = {}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onLogin'>

export type OnLogingParams = {
  returnUrl: string,
  openModal: {
    name: string,
    metadata: any
  }
}