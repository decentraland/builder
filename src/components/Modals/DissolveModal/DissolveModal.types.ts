import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Land } from 'modules/land/types'
import { Dispatch } from 'redux'
import { dissolveEstateRequest, DissolveEstateRequestAction } from 'modules/land/actions'

export type Props = ModalProps & {
  onDissolve: typeof dissolveEstateRequest
  metadata: {
    land: Land
  }
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onDissolve'>
export type MapDispatch = Dispatch<DissolveEstateRequestAction>
