import { Project } from 'modules/project/types'

export type Props = {
  currentProject?: Project
}

export type MapStateProps = Pick<Props, 'currentProject'>
export type MapDispatchProps = {}
