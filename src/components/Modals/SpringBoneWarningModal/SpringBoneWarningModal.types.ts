import { BodyShape } from '@dcl/schemas'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type SpringBoneWarningModalMetadata = {
  itemName: string
  missingShapes: BodyShape[]
  onSaveAnyway: () => void
}

export type Props = ModalProps & {
  metadata: SpringBoneWarningModalMetadata
}
