import { RouteComponentProps } from 'react-router'

import { Project } from 'modules/project/types'

export type QueryParams = {
  projectId?: string
}

export type Props = RouteComponentProps<{}> & {
  project?: Project
}

export type MapStateProps = Pick<Props, 'project'>
