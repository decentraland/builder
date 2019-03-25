export type Props = {
  onWatchVideo: () => void
  onStart: () => void
}

export type MapDispatchProps = Pick<Props, 'onWatchVideo'>
