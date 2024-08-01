export type Props = {
  onClose: () => unknown
  pushChangesProgress: number
}

export type OwnProps = Pick<Props, 'onClose'>
export type MapStateProps = Pick<Props, 'pushChangesProgress'>
