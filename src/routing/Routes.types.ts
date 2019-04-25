import { RouteComponentProps } from 'react-router'

export type Props = RouteComponentProps & {
  projectCount: number
}

export type MapStateProps = Pick<Props, 'projectCount'>

export type State = {
  hasError: boolean
  stackTrace: string
}
