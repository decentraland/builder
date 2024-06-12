import { Land } from 'modules/land/types'
import { RouteComponentProps } from 'react-router'

export type Props = {
  land: Land
  title?: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
} & RouteComponentProps
