import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { importProject } from 'modules/project/actions'
import { Manifest } from 'modules/project/types'

export type Props = ModalProps & {
  onImport: typeof importProject
}

export type State = {
  acceptedProjects: ImportedFile[]
  canImport: boolean
}

export type MapDispatchProps = Pick<Props, 'onImport'>

export type ImportedFile = {
  id: string
  fileName: string
  manifest?: Manifest
  isCorrupted?: boolean
}
