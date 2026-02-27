import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type CreatorHubUpgradeModalMetadata = {
  worldName?: string
  isCollaboratorsTabShown?: boolean
  variant?: 'permissions'
}

export type Props = ModalProps & {
  metadata: CreatorHubUpgradeModalMetadata
}
