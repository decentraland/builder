import { Media } from 'modules/media/types'
import { Project } from 'modules/project/types'
import { Coordinate, Rotation, Placement, Deployment } from 'modules/deployment/types'
import { LandTile } from 'modules/land/types'
import { Scene } from 'modules/scene/types'

export type Props = {
  project: Project
  scene: Scene | null
  media: Media | null
  isLoggedIn: boolean
  deployment?: Deployment | null
  deploymentsByCoord: Record<string, Deployment>
  landTiles: Record<string, LandTile>
  onNoAuthorizedParcels: () => void
  onConfirmPlacement: (placement: Placement, overrideDeploymentId?: string) => void
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  hover: Coordinate
  rotation: Rotation
  zoom: number
  currentLandId: string | null
}
