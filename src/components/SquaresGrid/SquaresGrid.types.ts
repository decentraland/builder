export type DefaultProps = {
  size: 'tiny' | 'small' | 'medium' | 'big' | ''
  onClick: () => void
}

export type Props = DefaultProps & {
  rows: number
  cols: number
}
