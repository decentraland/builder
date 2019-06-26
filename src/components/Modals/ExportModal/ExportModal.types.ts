import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { exportProjectRequest } from 'modules/project/actions'

export type Props = ModalProps & {
  isLoading: boolean
  progress: number
  total: number
  onExport: typeof exportProjectRequest
}

export type MapDispatchProps = Pick<Props, 'onExport'>
