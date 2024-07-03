import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { DecodedURN, URN, URNType } from 'lib/urn'

export type State = {
  newURNSection: string
}

export type Props = ModalProps & {
  elementName: string
  urn: URN
  isLoading: boolean
  error: string | null
  onBuildURN: (
    decodedURN: DecodedURN<URNType.COLLECTIONS_THIRDPARTY> | DecodedURN<URNType.COLLECTIONS_THIRDPARTY_V2>,
    newURNSection: string
  ) => string
  onSave: (newURN: string) => void
}
