import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Atlas as AtlasComponent, Layer } from 'decentraland-ui'
import { Tile, Props } from './Atlas.types'
import { coordsToId } from 'modules/land/utils'
import { RoleType, Land } from 'modules/land/types'
import Popup from './Popup'

const getCoords = (x: number | string, y: number | string) => `${x},${y}`

const Atlas: React.FC<Props> = props => {
  const { atlasTiles, isEstate, landTiles, deploymentTiles, showOwner, showOperator, hasPopup } = props

  const [showPopup, setShowPopup] = useState(false)
  const [hoveredLand, setHoveredLand] = useState<Land | null>(null)
  const [mouseX, setMouseX] = useState(-1)
  const [mouseY, setMouseY] = useState(-1)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const timeout = useRef<NodeJS.Timer | null>(null)

  const selection = useMemo(() => (props.selection || []).reduce((set, pair) => set.add(getCoords(pair.x, pair.y)), new Set<string>()), [
    props.selection
  ])

  const isSelected = useCallback(
    (x: number, y: number) => {
      if (selection.has(getCoords(x, y))) return true
      // This is a workaround to paint the large estates, because GraphQL can return only up to 1000 results
      // and some Estates have more parcels than thats
      if (!atlasTiles) return false
      const id = selection.values().next().value as string
      const center = atlasTiles[id] as Tile
      const tile = atlasTiles[getCoords(x, y)] as Tile
      if (center && tile && center.estate_id && tile.estate_id && center.estate_id === tile.estate_id && isEstate) {
        return true
      }
      return false
    },
    [selection, atlasTiles, isEstate]
  )

  const selectedStrokeLayer: Layer = useCallback(
    (x, y) => {
      return isSelected(x, y) ? { color: '#ff0044', scale: 1.4 } : null
    },
    [isSelected]
  )

  const selectedFillLayer: Layer = useCallback(
    (x, y) => {
      return isSelected(x, y) ? { color: '#ff9990', scale: 1.2 } : null
    },
    [isSelected]
  )
  const shouldPan = isEstate && props.selection && props.selection.length > 0 && props.size
  const panX = shouldPan ? Math.floor(((props.selection!.length + 1) % 2) * props.size * -0.5) : 0
  const panY = shouldPan ? Math.floor(((props.selection!.length + 1) % 2) * props.size * -0.5) : 0

  const landLayer: Layer = useCallback(
    (x, y) => {
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      if (tile) {
        if ((showOwner && tile.land.role === RoleType.OWNER) || (showOperator && tile.land.role === RoleType.OPERATOR)) {
          return tile
        }
      }
      return null
    },
    [landTiles, showOwner, showOperator]
  )

  const deploymentLayer: Layer = useCallback(
    (x, y) => {
      const id = coordsToId(x, y)
      const tile = deploymentTiles[id]
      return tile || null
    },
    [deploymentTiles]
  )

  const handleHover = useCallback(
    (x: number, y: number) => {
      if (!hasPopup) return
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      if (tile && !showPopup) {
        setShowPopup(true)
        setHoveredLand(tile.land)
        setMouseX(-1)
        setMouseY(-1)
      } else if (tile && tile.land !== hoveredLand) {
        setHoveredLand(tile.land)
        setMouseX(-1)
        setMouseY(-1)
      } else if (!tile && showPopup) {
        setShowPopup(false)
      }
    },
    [hoveredLand, showPopup, landTiles]
  )

  // fade effect
  useEffect(() => {
    if (!showPopup) {
      timeout.current = setTimeout(() => setHoveredLand(null), 250)
    } else if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = null
    }
  }, [showPopup])

  // mouse move
  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (showPopup && mouseX === -1 && mouseY === -1) {
        setMouseX(event.layerX)
        setMouseY(event.layerY)
        setX(event.layerX)
        setY(event.layerY)
      }
    }
    if (hasPopup) {
      document.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (hasPopup) {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [hasPopup, showPopup, mouseX, mouseY])

  return (
    <>
      <AtlasComponent
        panX={panX}
        panY={panY}
        {...props}
        tiles={atlasTiles}
        layers={[landLayer, deploymentLayer, ...(props.layers || []), selectedStrokeLayer, selectedFillLayer]}
        onHover={handleHover}
      />
      {hoveredLand ? <Popup x={x} y={y} visible={showPopup} land={hoveredLand} /> : null}
    </>
  )
}

Atlas.defaultProps = {
  showOperator: true,
  showOwner: true,
  hasPopup: false
}

export default Atlas
