import { Land } from 'modules/land/types'
import { Project } from 'modules/project/types'
import { Dispatch } from 'redux'

export type Props = {
  id: string | null
  land: Land | null
  isLoading: boolean
  projects: Project[]
  children: (id: string | null, land: Land | null, projects: Project[], isLoading: boolean) => React.ReactNode
}

export type MapStateProps = Pick<Props, 'id' | 'land' | 'isLoading' | 'projects'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
export type OwnProps = Partial<Pick<Props, 'id'>>
