import * as React from 'react'
import { ModalNavigation, ModalActions, Button, Layer, Coord, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import './EstateEditorModal.css'
import { Atlas } from 'components/Atlas'
import { getCenter, getSelection, getCoordMatcher, areConnected, coordsToId, getCoordsToAdd, getCoordsToRemove } from 'modules/land/utils'
import { LandType, Land } from 'modules/land/types'
import { Props, State } from './EstateEditorModal.types'

const MAX_PARCELS_PER_TX = 12

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

const getOriginalParcels = (land: Land) => {
  return land.type === LandType.PARCEL ? [] : land.parcels!
}

export default class EstateEditorModal extends React.PureComponent<Props, State> {
  state: State = {
    name: '',
    description: '',
    selection: getInitialSelection(this.props.metadata.land),
    showCreationForm: false
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
    return this.getCoordsToAdd().length > MAX_PARCELS_PER_TX
  }

  hasReachedRemoveLimit() {
    return this.getCoordsToRemove().length > MAX_PARCELS_PER_TX
  }

  getCoordsToAdd() {
    const { land } = this.props.metadata
    return getCoordsToAdd(getOriginalParcels(land), this.state.selection)
  }

  getCoordsToRemove() {
    const { land } = this.props.metadata
    return getCoordsToRemove(getOriginalParcels(land), this.state.selection)
  }

  handleSubmit = () => {
    const { onCreateEstate, onEditEstate, metadata } = this.props
    const { land } = metadata
    if (land.type === LandType.PARCEL) {
      // creating a new estate
      if (!this.state.showCreationForm) {
        this.setState({ showCreationForm: true })
      } else {
        const { name, description, selection } = this.state
        onCreateEstate(name, description, selection)
      }
    } else {
      // editing an existing estate
      const toAdd = this.getCoordsToAdd()
      const toRemove = this.getCoordsToRemove()
      onEditEstate(land, toAdd, toRemove)
    }
  }

  handleCancel = () => {
    const { onClose } = this.props
    const { showCreationForm } = this.state
    if (showCreationForm) {
      this.setState({ showCreationForm: false })
    } else {
      onClose()
    }
  }

  render() {
    const { metadata } = this.props
    const { name, description, showCreationForm } = this.state
    const { land } = metadata
    const [x, y] = getInitialCoords(land)

    const isTooSmall = this.isTooSmall()
    const hasReachedAddLimit = this.hasReachedAddLimit()
    const hasReachedRemoveLimit = this.hasReachedRemoveLimit()
    const isValidSelection = !isTooSmall && !hasReachedAddLimit && !hasReachedRemoveLimit
    const isValidForm = !showCreationForm || name.length > 0
    const isEditing = land.type === LandType.ESTATE
    const isDisabled = !isValidSelection || !isValidForm

    return (
      <Modal name={this.props.name}>
        <ModalNavigation
          title={isEditing ? 'Edit Estate' : 'Build Estate'}
          subtitle={isEditing ? 'Add or remove parcels' : 'Select parcels to include in this Estate'}
        />

        {showCreationForm ? (
          <div className="form">
            <Field label="Name" placeholder="My Estate..." value={name}></Field>
            <Field label="Description" placeholder="some description..." value={description}></Field>
          </div>
        ) : (
          <div className="map">
            <Atlas x={x} y={y} onClick={this.handleClick} hasLink={false} layers={[this.selectedStrokeLayer, this.selectedFillLayer]} />
          </div>
        )}

        <ModalActions>
          <Button primary disabled={isDisabled}>
            Submit
          </Button>
          <Button onClick={this.handleCancel}>Cancel</Button>
        </ModalActions>
      </Modal>
    )
  }
}
