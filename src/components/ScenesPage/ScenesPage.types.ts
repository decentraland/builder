import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Project } from 'modules/project/types'
import { SortBy } from 'modules/ui/dashboard/types'

export type DefaultProps = {
  projects: Project[]
}

export type Props = DefaultProps & {
  isFetching: boolean
  isLoggingIn: boolean
  didCreate: boolean
  page: number
  sortBy: SortBy
  totalPages: number
  onOpenModal: ActionFunction<typeof openModal>
}
