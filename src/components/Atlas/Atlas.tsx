import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Atlas as AtlasComponent, Layer } from 'decentraland-ui'
import { coordsToId, isCoords, idToCoords, getCenter, selectionBorderColorByRole } from 'modules/land/utils'
import { RoleType, Land, LandTile } from 'modules/land/types'
import { locations } from 'routing/locations'
import Popup from './Popup'
import Control from './Control'
import { Props } from './Atlas.types'
import './Atlas.css'

const getCoords = (x: number | string, y: number | string) => `${x},${y}`

const Atlas: React.FC<Props> = props => {
  const {
    landId,
    atlasTiles,
    landTiles,
    emptyTiles,
    showOwner,
    showOperator,
    showTenant = true,
    showLessor = true,
    showControls,
    hasPopup,
    className,
    hasLink,
    onNavigate,
    onLocateLand
  } = props

  const [showPopup, setShowPopup] = useState(false)
  const [hoveredLand, setHoveredLand] = useState<Land | null>(null)
  const [mouseX, setMouseX] = useState(-1)
  const [mouseY, setMouseY] = useState(-1)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [zoom, setZoom] = useState<number>(props.zoom || 1)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    [props.x, props.y, landId, isEstate, selection]
  )

  const shouldShowLayer = (tile?: LandTile, showOwner?: boolean, showOperator?: boolean, showTenant?: boolean, showLessor?: boolean) => {
    return (
      !!tile &&
      ((!!showOwner && tile.land.role === RoleType.OWNER) ||
        (!!showOperator && tile.land.role === RoleType.OPERATOR) ||
        (!!showTenant && tile.land.role === RoleType.TENANT) ||
        (!!showLessor && tile.land.role === RoleType.LESSOR))
    )
  }

  const landLayer: Layer = useCallback(
    (x, y) => {
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      if (shouldShowLayer(tile, showOwner, showOperator, showTenant)) {
        return tile || null
      }
      return null
    },
    [landTiles, showOwner, showOperator, showTenant]
  )

  const unoccupiedLayer: Layer = useCallback(
    (x, y) => {
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      if (shouldShowLayer(tile, showOwner, showOperator, showTenant, showLessor)) {
        return emptyTiles[id] || null
      }
      return null
    },
    [emptyTiles, landTiles, showOwner, showOperator, showTenant, showLessor]
  )

  const handleHover = useCallback(
    (x: number, y: number) => {
      if (!hasPopup) return
      if (selection.has(getCoords(x, y))) {
        setShowPopup(false)
        return
      }
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
    [hoveredLand, showPopup, landTiles, hasPopup, selection]
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

  const handleLocateLand = useCallback(() => {
    if (onLocateLand) {
      onLocateLand()
    }
  }, [onLocateLand])

  const handleZoomOut = useCallback(() => {
    setZoom(zoom - 0.5)
  }, [zoom, setZoom])

  const handleZoomIn = useCallback(() => {
    setZoom(zoom + 0.5)
  }, [zoom, setZoom])

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
        setMouseX(event.offsetX)
        setMouseY(event.offsetY)
        setX(event.offsetX)
        setY(event.offsetY)
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
    const getRole = (x: number, y: number) => {
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      return tile.land.role
    }
    const selectionBorderLayer: Layer = (x, y) =>
      isSelected(x, y) ? { color: selectionBorderColorByRole[getRole(x, y)], scale: 1.2 } : null
    const selectionLandLayer: Layer = (x, y) => (isSelected(x, y) ? landLayer(x, y) : null)
    const selectionUnoccupiedLayer: Layer = (x, y) => (isSelected(x, y) ? unoccupiedLayer(x, y) : null)
    selectionLayers = [selectionBorderLayer, selectionLandLayer, selectionUnoccupiedLayer]
  }

  return (
    <>
      <AtlasComponent
        onHover={handleHover}
        onClick={handleClick}
        {...props}
        zoom={zoom}
        x={props.x || landX}
        y={props.y || landY}
        maxX={163}
        maxY={158}
        className={classes.join(' ')}
        tiles={atlasTiles}
        layers={[landLayer, unoccupiedLayer, ...selectionLayers, ...(props.layers || [])]}
      />
      {hoveredLand ? <Popup x={x} y={y} visible={showPopup} land={hoveredLand} /> : null}
      {showControls ? (
        <div className="dcl atlas-control-container">
          <Control content={t('atlas.locate_land')} icon="locate-land" onClick={handleLocateLand} />
          <div className="control-group">
            <Control content={t('atlas.zoom_out')} icon="atlas-zoom-out" onClick={handleZoomOut} />
            <Control content={t('atlas.zoom_in')} icon="atlas-zoom-in" onClick={handleZoomIn} />
          </div>
        </div>
      ) : null}
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
