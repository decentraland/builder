import { Layout } from 'modules/project/types'

export type Props = {
  rows: number
  cols: number
  onChange: (layout: Partial<Layout>) => void
  errorMessage?: string
  showGrid?: boolean
}
