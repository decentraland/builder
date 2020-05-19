import React, { useCallback, useMemo } from 'react'
import { Atlas as AtlasComponent, Layer } from 'decentraland-ui'
import { Tile, Props } from './Atlas.types'

const getCoords = (x: number | string, y: number | string) => `${x},${y}`

const Atlas = (props: Props) => {
  const { tiles, isEstate } = props

  const selection = useMemo(() => (props.selection || []).reduce((set, pair) => set.add(getCoords(pair.x, pair.y)), new Set<string>()), [
    props.selection
  ])

  const isSelected = useCallback(
    (x: number, y: number) => {
      if (selection.has(getCoords(x, y))) return true
      // This is a workaround to paint the large estates, because GraphQL can return only up to 1000 results
      // and some Estates have more parcels than thats
      if (!tiles) return false
      const id = selection.values().next().value as string
      const center = tiles[id] as Tile
      const tile = tiles[getCoords(x, y)] as Tile
      if (center && tile && center.estate_id && tile.estate_id && center.estate_id === tile.estate_id && isEstate) {
        return true
      }
      return false
    },
    [selection, tiles, isEstate]
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

  return (
    <AtlasComponent
      panX={panX}
      panY={panY}
      {...props}
      tiles={tiles}
      layers={[...(props.layers || []), selectedStrokeLayer, selectedFillLayer]}
    />
  )
}

export default Atlas
