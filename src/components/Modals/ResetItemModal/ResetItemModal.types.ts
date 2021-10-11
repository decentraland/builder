import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  metadata: Metadata
}

export type Metadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata'>
