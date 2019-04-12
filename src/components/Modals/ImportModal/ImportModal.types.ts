import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { importProject } from 'modules/project/actions'
import { SavedProject } from 'modules/project/types'

export type Props = ModalProps & {
  onImport: typeof importProject
}

export type State = {
  acceptedProjects: SavedProject[] | []
}

export type MapDispatchProps = Pick<Props, 'onImport'>
