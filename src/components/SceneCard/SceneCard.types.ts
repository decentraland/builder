import { ReactNode } from 'react'

export type Props = {
  title: string
  subtitle?: string | ReactNode
  videoSrc?: string
  imgSrc: string
  description: string
  disabled?: boolean
  onClick: () => void
}
