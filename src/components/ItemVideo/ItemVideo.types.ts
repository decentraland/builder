import { Item } from 'modules/item/types'

export type Props = {
  item?: Item
  className?: string
  src?: string
  showMetrics?: boolean
  previewIcon?: React.ReactNode
}
