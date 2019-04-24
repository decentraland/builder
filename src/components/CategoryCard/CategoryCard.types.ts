import { Category } from 'modules/ui/sidebar/types'

export type Props = {
  category: Category
  special?: boolean
  onClick: (name: string) => void
}
