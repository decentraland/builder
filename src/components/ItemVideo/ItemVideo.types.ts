import { RefObject } from 'react'
import { Item } from 'modules/item/types'

export type Props = {
  item?: Item
  className?: string
  src?: string
  showMetrics?: boolean
  previewIcon?: React.ReactNode
  children?: (video: RefObject<HTMLVideoElement>, duration: number, size: number, isLoading: boolean) => React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}
