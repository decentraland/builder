import { Media } from 'modules/media/types'
import { Project } from 'modules/project/types'
import { Coordinate, Rotation, Placement } from 'modules/deployment/types'

export type Props = {
  ethAddress: string | undefined
  project: Project | null
  media: Media | null
  initialPoint?: Coordinate
  onNoAuthorizedParcels: () => void
  onConfirmPlacement: (placement: Placement) => void
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  parcels: Record<string, { x: number; y: number }>
  hover: Coordinate
  rotation: Rotation
  zoom: number
  landTarget: string | null
}
