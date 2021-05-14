import * as React from 'react'
import { ModalNavigation, ModalActions, Button, Layer, Coord, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Atlas } from 'components/Atlas'
import Info from 'components/Info'
import {
  getCenter,
  getSelection,
  getCoordMatcher,
  areConnected,
  coordsToId,
  getCoordsToAdd,
  getCoordsToRemove,
  MAX_PARCELS_PER_TX
} from 'modules/land/utils'
import { LandType, Land } from 'modules/land/types'
import { Props, State } from './EstateEditorModal.types'
import './EstateEditorModal.css'

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
  return land.type === LandType.PARCEL ? [] : land.parcels!.map(({ id, ...coord }) => coord)
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
    const coordsToAdd = this.getCoordsToAdd()
    const coordsToRemove = this.getCoordsToRemove()
    const hasReachedAddLimit = coordsToAdd.length > MAX_PARCELS_PER_TX
    const hasReachedRemoveLimit = coordsToRemove.length > MAX_PARCELS_PER_TX
    const isValidSelection = !isTooSmall && !hasReachedAddLimit && !hasReachedRemoveLimit
    const isValidForm = !showCreationForm || name.length > 0
    const isEditing = land.type === LandType.ESTATE
    const isDisabled = !isValidSelection || !isValidForm
    const needsTwoTxs = !isDisabled && coordsToAdd.length > 0 && coordsToRemove.length > 0

    let onClose
    let onBack
    if (showCreationForm) {
      onBack = this.handleCancel
    } else {
      onClose = this.handleCancel
    }

    return (
      <Modal name={this.props.name}>
        <ModalNavigation
          title={isEditing ? t('estate_editor.title_edit') : t('estate_editor.title_create')}
          subtitle={
            isEditing
              ? t('estate_editor.subtitle_edit')
              : showCreationForm
              ? t('estate_editor.subtitle_form')
              : t('estate_editor.subtitle_create')
          }
          onClose={onClose}
          onBack={onBack}
        />

        {showCreationForm ? (
          <div className="form">
            <Field
              label={t('estate_editor.name_label')}
              placeholder={t('estate_editor.name_placeholder')}
              value={name}
              onChange={(_event, props) => this.setState({ name: props.value })}
            ></Field>
            <Field
              label={t('estate_editor.description_label')}
              placeholder={t('estate_editor.description_placeholder')}
              value={description}
              onChange={(_event, props) => this.setState({ description: props.value })}
            ></Field>
          </div>
        ) : (
          <div className="map">
            <Atlas x={x} y={y} onClick={this.handleClick} hasLink={false} layers={[this.selectedStrokeLayer, this.selectedFillLayer]} />
          </div>
        )}
        <div className="messages-container">
          <div className="messages">
            {hasReachedAddLimit ? (
              <div className="message warning">
                <div className="icon" />
                {t('estate_editor.add_limit_reached', { max: MAX_PARCELS_PER_TX })}
              </div>
            ) : null}
            {hasReachedRemoveLimit ? (
              <div className="message warning">
                <div className="icon" />
                {t('estate_editor.remove_limit_reached', { max: MAX_PARCELS_PER_TX })}
              </div>
            ) : null}
            {needsTwoTxs ? (
              <div className="message info">
                <Info />
                {t('estate_editor.needs_two_txs', { toAdd: coordsToAdd.length, toRemove: coordsToRemove.length })}
              </div>
            ) : null}
          </div>
        </div>
        <ModalActions>
          <Button onClick={this.handleCancel}>{isEditing || !showCreationForm ? t('global.cancel') : t('global.back')}</Button>
          <Button primary disabled={isDisabled} onClick={this.handleSubmit}>
            {isEditing || showCreationForm ? t('global.submit') : t('global.continue')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }
}
