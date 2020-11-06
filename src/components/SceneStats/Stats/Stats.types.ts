import { WeeklyStats } from 'modules/stats/types'

export type Props = {
  label: string
  stats: WeeklyStats | null
  isLoading: boolean
  children: (stats: WeeklyStats | null) => string
}
