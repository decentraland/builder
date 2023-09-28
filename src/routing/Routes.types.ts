import { RouteComponentProps } from 'react-router'

export type Props = RouteComponentProps & {
  inMaintenance: boolean
  isWorldsForEnsOwnersEnabled: boolean
}

export type MapStateProps = Pick<Props, 'inMaintenance' | 'isWorldsForEnsOwnersEnabled'>

export type State = {
  hasError: boolean
  stackTrace: string
}
