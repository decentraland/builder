export type IconName =
  | 'alert'
  | 'arrow-down'
  | 'arrow-key-down'
  | 'arrow-key-left'
  | 'arrow-key-right'
  | 'arrow-key-up'
  | 'arrow-up'
  | 'atlas-zoom-in'
  | 'atlas-zoom-out'
  | 'camera'
  | 'center-camera'
  | 'chevron-right'
  | 'close'
  | 'cloud-upload'
  | 'delete'
  | 'duplicate'
  | 'edit-active'
  | 'edit'
  | 'export'
  | 'facebook'
  | 'geometries'
  | 'grid-active'
  | 'grid'
  | 'import'
  | 'list-active'
  | 'list'
  | 'locate-land'
  | 'modal-back'
  | 'modal-close'
  | 'move-active'
  | 'move'
  | 'preview-active'
  | 'preview'
  | 'rotate-active'
  | 'rotate-left'
  | 'rotate-right'
  | 'rotate'
  | 'scale'
  | 'scene-object'
  | 'scene-parcel'
  | 'share'
  | 'shortcuts'
  | 'sidebar-active'
  | 'sidebar'
  | 'textures'
  | 'triangles'
  | 'twitter'
  | 'undo'
  | 'zoom-in'
  | 'zoom-out'

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
