import { Media } from 'modules/media/types'
import { Project } from 'modules/project/types'
import { Coordinate, Rotation, Placement, OccupiedAtlasParcel } from 'modules/deployment/types'
import { LandTile } from 'modules/land/types'

export type Props = {
  ethAddress: string | undefined
  project: Project
  media: Media | null
  isLoggedIn: boolean
  initialPoint?: Coordinate
  occupiedParcels: Record<string, OccupiedAtlasParcel>
  landTiles: Record<string, LandTile>
  onNoAuthorizedParcels: () => void
  onConfirmPlacement: (placement: Placement) => void
  onClearDeployment: (projectId: string) => void
  onFetchDeployments: () => void
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  hover: Coordinate
  rotation: Rotation
  zoom: number
  landTarget: string | null
}
