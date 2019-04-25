import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { importProject } from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'

export type Props = ModalProps & {
  onImport: typeof importProject
}

export type State = {
  acceptedProjects: ImportedFile[] | []
  canImport: boolean
}

export type MapDispatchProps = Pick<Props, 'onImport'>

export type ImportedFile = {
  id: string
  project: (Project & { thumbnail?: string }) | null
  scene: Scene | null
  fileName: string
  isCorrupted?: boolean
}
