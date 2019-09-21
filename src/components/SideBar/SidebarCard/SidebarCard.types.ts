export type Props = {
  id: string
  title: string
  thumbnail: string
  isVisible: boolean
  isNew?: boolean
  onClick: (id: string) => void
}
