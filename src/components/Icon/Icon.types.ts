export type IconName =
  | 'alert'
  | 'arrow-down'
  | 'arrow-up'
  | 'chevron-right'
  | 'close'
  | 'cloud-upload'
  | 'delete'
  | 'duplicate'
  | 'grid'
  | 'grid-active'
  | 'list'
  | 'list-active'
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
  | 'arrow-key-up'
  | 'arrow-key-down'
  | 'arrow-key-left'
  | 'arrow-key-right'
  | 'import'
  | 'export'
  | 'atlas-zoom-in'
  | 'atlas-zoom-out'
  | 'locate-land'
  | 'rotate-left'
  | 'rotate-right'
  | 'modal-back'
  | 'modal-close'
  | 'triangles'
  | 'geometries'
  | 'textures'
  | 'camera'

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
