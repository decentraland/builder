import { Tile } from 'react-tile-map/dist/lib/common'
import { AtlasTile, AtlasProps } from 'decentraland-ui'
import { LandTile } from 'modules/land/types'

export type Props = Partial<AtlasProps> & {
  atlasTiles: Record<string, AtlasTile>
  landTiles: Record<string, LandTile>
  emptyTiles: Record<string, Tile>
  showOperator?: boolean
  showTenant?: boolean
  showLessor?: boolean
  showControls?: boolean
  landId?: string
  showOwner?: boolean
  hasPopup?: boolean
  hasLink?: boolean
  onLocateLand?: () => void
}

export type MapStateProps = Pick<Props, 'atlasTiles' | 'landTiles' | 'emptyTiles'>
