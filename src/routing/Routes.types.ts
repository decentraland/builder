export type Props = {
  projectCount: number
}

export type MapStateProps = Pick<Props, 'projectCount'>

export type State = {
  hasError: boolean
  stackTrace: string
}
