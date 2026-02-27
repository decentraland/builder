import { ReactNode } from 'react'
import { RouteComponentProps } from 'react-router'

export type Props = RouteComponentProps & {
  inMaintenance: boolean
}

export type ErrorBoundaryProps = {
  children: ReactNode
  onError: (error: Error) => void
}

export type ErrorBoundaryState = {
  hasError: boolean
}

export type MapStateProps = Pick<Props, 'inMaintenance'>

export type RoutesContainerProps = Omit<Props, 'inMaintenance'>
