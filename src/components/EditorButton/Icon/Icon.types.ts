export type Props = {
  name: 'list' | 'grid'
  isActive?: boolean
}

export type MapStateProps = Pick<Props, 'name'>
export type MapDispatchProps = {}
