import { BackProps } from 'decentraland-ui'

export type Props = BackProps & {
  hasHistory: boolean
}

export type MapStateProps = Pick<Props, 'hasHistory'>
