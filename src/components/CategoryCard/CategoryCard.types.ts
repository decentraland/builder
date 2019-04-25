import { Category } from 'modules/ui/sidebar/types'

export type Props = {
  category: Category
  onClick: (name: string) => void
}
