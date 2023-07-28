import { Project } from 'modules/project/types'
import { MigrateToSDK7RequestAction } from 'modules/scene/actions'
import { Scene } from 'modules/scene/types'
import { Dispatch } from 'react'

export enum MigrateStep {
  INFO = 'info',
  MIGRATE = 'migrate'
}

export type Props = {
  project: Project | null
  scene: Scene | null
  isLoading: boolean
  isSavingSDK6Copy: boolean
  isSavingScene: boolean
  onClose: () => void
  onMigrateScene: (project: Project, shouldSaveCopy: boolean) => void
  onNavigate: (location: string) => void
}

export type MapStateProps = Pick<Props, 'isLoading' | 'isSavingSDK6Copy' | 'isSavingScene'>
export type OwnProps = Omit<Props, keyof MapStateProps | keyof MapDispatchProps>
export type MapDispatchProps = Pick<Props, 'onMigrateScene'>
export type MapDispatch = Dispatch<MigrateToSDK7RequestAction>
