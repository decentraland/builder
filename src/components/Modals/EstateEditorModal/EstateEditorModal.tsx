import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props, State } from './EstateEditorModal.types'
import './EstateEditorModal.css'
import { Atlas } from 'components/Atlas'
import { getCenter, getSelection, coordsToId } from 'modules/land/utils'
import { LandType } from 'modules/land/types'
import { ModalNavigation, ModalActions, Button, Layer } from 'decentraland-ui'

export default class EstateEditorModal extends React.PureComponent<Props, State> {
  state: State = {
    selection: []
  }

  handleClick = (x: number, y: number) => {
    debugger
    if (!this.isSelected(x, y)) {
      this.addParcel(x, y)
      return
    } else {
      this.removeParcel(x, y)
      return
    }
  }

  isSelected(x: number, y: number) {
    const id = coordsToId(x, y)
    return this.state.selection.some(_id => _id === id)
  }

  addParcel(x: number, y: number) {
    this.setState({ selection: [...this.state.selection, coordsToId(x, y)] })
  }

  removeParcel(x: number, y: number) {
    if (!this.isSelected(x, y)) return
    const id = coordsToId(x, y)
    this.setState({ selection: this.state.selection.filter(_id => _id !== id) })
  }

  selectedStrokeLayer: Layer = (x, y) => {
    return this.isSelected(x, y) ? { color: '#ff0044', scale: 1.4 } : null
  }

  selectedFillLayer: Layer = (x, y) => {
    return this.isSelected(x, y) ? { color: '#ff9990', scale: 1.2 } : null
  }

  render() {
    const { name, metadata } = this.props
    const { land, isEditing } = metadata

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

    return (
      <Modal name={name}>
        <ModalNavigation
          title={isEditing ? 'Edit Estate' : 'Build Estate'}
          subtitle={isEditing ? 'Add or remove parcels' : 'Select parcels to include in this Estate'}
        />
        <div className="map">
          <Atlas x={x} y={y} onClick={this.handleClick(x, y)} hasLink={false} layers={[this.selectedStrokeLayer, this.selectedFillLayer]} />
        </div>
        <ModalActions>
          <Button primary>Submit</Button>
          <Button>Cancel</Button>
        </ModalActions>
      </Modal>
    )
  }
}
