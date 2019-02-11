export type IconName =
  | 'alert'
  | 'arrow-down'
  | 'arrow-up'
  | 'close'
  | 'delete'
  | 'delete-active'
  | 'delete-icon'
  | 'duplicate'
  | 'duplicate-active'
  | 'grid'
  | 'grid-active'
  | 'info'
  | 'list'
  | 'list-active'
  | 'list-icon'
  | 'move'
  | 'move-active'
  | 'preview'
  | 'preview-active'
  | 'rotate'
  | 'rotate-active'
  | 'shortcuts'
  | 'sidebar'
  | 'sidebar-active'
  | 'undo'
  | 'zoom-in'
  | 'zoom-out'
  | 'center-camera'
  | 'edit'
  | 'edit-active'

export type DefaultProps = {
  isActive: boolean
  className: string
  onClick: (event: React.MouseEvent<HTMLElement>) => any
}

export type Props = DefaultProps & {
  name: IconName
}

export type MapStateProps = Pick<Props, 'name'>
export type MapDispatchProps = {}
