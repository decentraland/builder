export type Props = {
  itemId: string
  isEnabled: boolean
}

export type MapStateProps = Pick<Props, 'isEnabled'>
export type OwnProps = Pick<Props, 'itemId'>
