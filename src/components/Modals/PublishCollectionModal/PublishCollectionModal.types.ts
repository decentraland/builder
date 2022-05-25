import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  metadata: any
  isRaritiesWithOracleEnabled: boolean
}

export type MapStateProps = Pick<Props, 'isRaritiesWithOracleEnabled'>
