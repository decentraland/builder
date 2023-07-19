import { RouteComponentProps } from 'react-router'

export type Props = RouteComponentProps & {
  inMaintenance: boolean
  isInspectorEnabled: boolean
}

export type MapStateProps = Pick<Props, 'inMaintenance' | 'isInspectorEnabled'>

export type State = {
  hasError: boolean
  stackTrace: string
}
