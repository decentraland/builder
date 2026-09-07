import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { exportProjectRequest } from 'modules/project/actions'

export type Props = ModalProps & {
  isLoading: boolean
  isSDK6: boolean
  progress: number
  total: number
  onExport: typeof exportProjectRequest
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'isLoading' | 'isSDK6' | 'progress' | 'total'>
export type MapDispatchProps = Pick<Props, 'onExport'>
