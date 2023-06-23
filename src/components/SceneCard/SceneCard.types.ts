import { ReactNode } from 'react'

export type Props = {
  title: string
  subtitle?: string | ReactNode
  videoSrc?: string | null
  imgSrc: string
  description: string
  disabled?: boolean
  tag?: {
    label: string
    color: string
  }
  onClick: () => void
}
