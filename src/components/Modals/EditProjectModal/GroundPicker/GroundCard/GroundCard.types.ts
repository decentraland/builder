export type Props = {
  name: string
  thumbnail: string
  isActive: boolean
  small: boolean
  className?: string
  onClick?: (name: string) => void
}
