import { Scene } from 'modules/scene/types'
import { Project } from 'modules/project/types'

export type Pool = Project & {
  groups: string[],
  likes: number
  like: boolean
}

export type Manifest<T = Project> = { version: number; project: T; scene: Scene }
