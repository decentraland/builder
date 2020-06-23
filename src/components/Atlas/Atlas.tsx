import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Atlas as AtlasComponent, Layer } from 'decentraland-ui'
import { Props } from './Atlas.types'
import { coordsToId } from 'modules/land/utils'
import { RoleType, Land } from 'modules/land/types'
import Popup from './Popup'
import { locations } from 'routing/locations'
import './Atlas.css'

const getCoords = (x: number | string, y: number | string) => `${x},${y}`

const Atlas: React.FC<Props> = props => {
  const { atlasTiles, isEstate, landTiles, unoccupiedTiles, showOwner, showOperator, hasPopup, onNavigate, className, hasLink } = props

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

  const unoccupiedLayer: Layer = useCallback(
    (x, y) => {
      const id = coordsToId(x, y)
      const tile = unoccupiedTiles[id]
      return tile || null
    },
    [unoccupiedTiles]
  )

  const handleHover = useCallback(
    (x: number, y: number) => {
      if (!hasPopup || selection.has(getCoords(x, y))) return
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

  const handleClick = useCallback(
    (x: number, y: number) => {
      if (!hasLink) return
      const id = coordsToId(x, y)
      if (id in landTiles && !selection.has(id)) {
        const { land } = landTiles[id]
        setShowPopup(false)
        onNavigate(locations.landDetail(land.id))
      }
    },
    [landTiles, selection, onNavigate, hasLink]
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

  // classes
  const classes: string[] = []
  if (className) {
    classes.push(className)
  }
  if (hoveredLand) {
    classes.push('clickable')
  }

  return (
    <>
      <AtlasComponent
        panX={panX}
        panY={panY}
        onHover={handleHover}
        onClick={handleClick}
        {...props}
        className={classes.join(' ')}
        tiles={atlasTiles}
        layers={[landLayer, unoccupiedLayer, ...(props.layers || [])]}
      />
      {hoveredLand ? <Popup x={x} y={y} visible={showPopup} land={hoveredLand} /> : null}
    </>
  )
}

Atlas.defaultProps = {
  showOperator: true,
  showOwner: true,
  hasPopup: false,
  hasLink: true
}

export default Atlas
