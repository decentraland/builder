import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './EstateEditorModal.types'
import './EstateEditorModal.css'
import { Atlas } from 'components/Atlas'
import { getCenter, getSelection, getCoordMatcher, areConnected, coordsToId } from 'modules/land/utils'
import { LandType, Land } from 'modules/land/types'
import { ModalNavigation, ModalActions, Button, Layer, Coord } from 'decentraland-ui'

const getInitialCoords = (land: Land) => {
  let x = 0
  let y = 0
  if (land.type === LandType.PARCEL) {
    x = land.x!
    y = land.y!
  } else {
    const selection = getSelection(land)
    const center = getCenter(selection)
    x = center[0]
    y = center[1]
  }

  return [x, y]
}

const getInitialSelection = (land: Land) => {
  return land.type === LandType.PARCEL ? [{ x: land.x!, y: land.y! }] : land.parcels!.map(parcel => ({ x: parcel.x, y: parcel.y }))
}

export default class EstateEditorModal extends React.PureComponent<Props, State> {
  state: State = {
    selection: getInitialSelection(this.props.metadata.land)
  }

  handleClick = (x: number, y: number) => {
    if (!this.isSelected(x, y)) {
      this.addParcel(x, y)
      return
    } else {
      this.removeParcel(x, y)
      return
    }
  }

  isSelected(x: number, y: number) {
    const coord: Coord = { x, y }
    return this.state.selection.some(getCoordMatcher(coord))
  }

  addParcel(x: number, y: number) {
    // check if coord is owned by the user
    const tile = this.props.landTiles[coordsToId(x, y)]
    const land = tile ? tile.land : null
    if (!land) return

    // check if coord is not part of other estate
    if (land.type === LandType.ESTATE && land.id !== this.props.metadata.land.id) return

    // check if coord is connected to the rest of the selection
    const coord: Coord = { x, y }
    const selection = [...this.state.selection, coord]
    if (!areConnected(selection)) return

    // add coord to selection
    this.setState({ selection })
  }

  removeParcel(x: number, y: number) {
    // check if cood is actually selected
    if (!this.isSelected(x, y)) return

    // compute new selection
    const coord: Coord = { x, y }
    const isCoord = getCoordMatcher(coord)
    const selection = this.state.selection.filter(coord => !isCoord(coord))

    // check if new selection is connected
    if (!areConnected(selection)) return

    // remove coord from selection
    this.setState({ selection })
  }

  selectedStrokeLayer: Layer = (x, y) => {
    return this.isSelected(x, y) ? { color: '#ff0044', scale: 1.4 } : null
  }

  selectedFillLayer: Layer = (x, y) => {
    return this.isSelected(x, y) ? { color: '#ff9990', scale: 1.2 } : null
  }

  isTooSmall() {
    return this.state.selection.length < 2
  }

  hasReachedAddLimit() {

  }

  hasReachedRemoveLimit() {

  }

  getCoordsToAdd() {
    const { land } = this.props.metadata
    const toAdd: Coord[] = []
    for (const coord of this.state.selection) {
      if (land.p)
    }
  }

  render() {
    const { name, metadata } = this.props
    const { land } = metadata
    const [x, y] = getInitialCoords(land)

    return (
      <Modal name={name}>
        <ModalNavigation
          title={land.type === LandType.ESTATE ? 'Edit Estate' : 'Build Estate'}
          subtitle={land.type === LandType.ESTATE ? 'Add or remove parcels' : 'Select parcels to include in this Estate'}
        />
        <div className="map">
          <Atlas x={x} y={y} onClick={this.handleClick} hasLink={false} layers={[this.selectedStrokeLayer, this.selectedFillLayer]} />
        </div>
        <ModalActions>
          <Button primary>Submit</Button>
          <Button>Cancel</Button>
        </ModalActions>
      </Modal>
    )
  }
}
