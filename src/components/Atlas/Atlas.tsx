import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Atlas as AtlasComponent, Layer } from 'decentraland-ui'
import { Props } from './Atlas.types'
import { coordsToId, isCoords, idToCoords, getCenter } from 'modules/land/utils'
import { RoleType, Land, LandTile } from 'modules/land/types'
import Popup from './Popup'
import { locations } from 'routing/locations'
import './Atlas.css'

const getCoords = (x: number | string, y: number | string) => `${x},${y}`

const Atlas: React.FC<Props> = props => {
  const { landId, atlasTiles, landTiles, emptyTiles, showOwner, showOperator, hasPopup, onNavigate, className, hasLink } = props

  const [showPopup, setShowPopup] = useState(false)
  const [hoveredLand, setHoveredLand] = useState<Land | null>(null)
  const [mouseX, setMouseX] = useState(-1)
  const [mouseY, setMouseY] = useState(-1)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const timeout = useRef<NodeJS.Timer | null>(null)

  let isEstate = false
  if (landId) {
    if (!isCoords(landId)) {
      isEstate = true
    } else if (landId in landTiles) {
      const tile = landTiles[landId]
      if (!isCoords(tile.land.id)) {
        isEstate = true
      }
    }
  }

  const selection = useMemo(() => {
    if (!landId) {
      return new Set<string>()
    } else if (!isEstate) {
      return new Set([landId])
    } else {
      return Object.keys(landTiles).reduce((set, coords) => {
        const tile = landTiles[coords]
        if (tile.land.id === landId) {
          set.add(coords)
        }
        return set
      }, new Set<string>())
    }
  }, [landTiles, landId, isEstate])

  const [landX, landY] = useMemo(
    () =>
      landId
        ? !isEstate
          ? idToCoords(landId)
          : getCenter(
              Array.from(selection).map(id => {
                const [x, y] = idToCoords(id)
                return { x, y }
              })
            )
        : [props.x, props.y],
    [landId, isEstate, selection]
  )

  const shouldPan = isEstate && props.selection && props.selection.length > 0 && props.size
  const panX = shouldPan ? Math.floor(((props.selection!.length + 1) % 2) * props.size * -0.5) : 0
  const panY = shouldPan ? Math.floor(((props.selection!.length + 1) % 2) * props.size * -0.5) : 0

  const shouldShowLayer = (tile?: LandTile, showOwner?: boolean, showOperator?: boolean) => {
    return !!tile && ((showOwner && tile.land.role === RoleType.OWNER) || (showOperator && tile.land.role === RoleType.OPERATOR))
  }

  const landLayer: Layer = useCallback(
    (x, y) => {
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      if (shouldShowLayer(tile, showOwner, showOperator)) {
        return tile || null
      }
      return null
    },
    [landTiles, showOwner, showOperator]
  )

  const unoccupiedLayer: Layer = useCallback(
    (x, y) => {
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      if (shouldShowLayer(tile, showOwner, showOperator)) {
        return emptyTiles[id] || null
      }
      return null
    },
    [emptyTiles, landTiles, showOwner, showOperator]
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

  let selectionLayers: Layer[] = []
  if (selection.size > 0) {
    const isSelected = (x: number, y: number) => {
      const id = coordsToId(x, y)
      return selection.has(id) && id in landTiles
    }
    const isOwner = (x: number, y: number) => {
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      return !!tile && tile.land.role === RoleType.OWNER
    }
    const highlightLayer: Layer = (x, y) => (isSelected(x, y) ? { color: isOwner(x, y) ? '#ff8199' : '#6ddff7', scale: 1.2 } : null)
    const selectionLandLayer: Layer = (x, y) => (isSelected(x, y) ? landLayer(x, y) : null)
    const selectionUnoccupiedLayer: Layer = (x, y) => (isSelected(x, y) ? unoccupiedLayer(x, y) : null)
    selectionLayers = [highlightLayer, selectionLandLayer, selectionUnoccupiedLayer]
  }

  return (
    <>
      <AtlasComponent
        panX={panX}
        panY={panY}
        onHover={handleHover}
        onClick={handleClick}
        {...props}
        x={props.x || landX}
        y={props.y || landY}
        className={classes.join(' ')}
        tiles={atlasTiles}
        layers={[landLayer, unoccupiedLayer, ...selectionLayers, ...(props.layers || [])]}
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
