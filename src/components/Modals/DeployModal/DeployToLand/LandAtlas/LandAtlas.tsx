import * as React from 'react'

import { Layer, Button, Popup, Icon as DCLIcon } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import { Atlas } from 'components/Atlas'
import Icon from 'components/Icon'
import { IconName } from 'components/Icon/Icon.types'
import { Rotation, Coordinate } from 'modules/deployment/types'
import { getParcelOrientation } from 'modules/project/utils'
import { idToCoords, coordsToId, locateNextLand } from 'modules/land/utils'
import { Props, State } from './LandAtlas.types'
import './LandAtlas.css'

const ROTATION_ORDER: Rotation[] = ['north', 'east', 'south', 'west']
const CLOCKWISE_ROTATION = 1
const ANTICLOCKWISE_ROTATION = -1

export const COLORS = Object.freeze({
  occupiedParcel: '#774642',
  freeParcel: '#ff9990',
  selected: '#ff9990',
  selectedStroke: '#ff0044',
  indicator: '#716b7a',
  indicatorStroke: '#3a3541'
})

export default class LandAtlas extends React.PureComponent<Props, State> {
  state: State = this.getBaseState()

  analytics = getAnalytics()

  getBaseState(): State {
    const { deployment, landTiles } = this.props
    const coords = Object.keys(landTiles)
    return {
      placement: deployment ? deployment.placement : null,
      hover: { x: 0, y: 0 },
      rotation: deployment ? deployment.placement.rotation : 'north',
      zoom: 1,
      currentLandId: deployment
        ? coordsToId(deployment.placement.point.x, deployment.placement.point.y)
        : coords.length > 0
        ? coords[0]
        : '0,0'
    }
  }

  isValid = () => {
    const { project, landTiles } = this.props
    const { rotation, hover } = this.state
    const projectParcels = getParcelOrientation(project!.layout, hover, rotation)

    if (!hover) return false

    return projectParcels.every(({ x, y }) => !!landTiles[`${x},${y}`])
  }

  isHighlighted = (x: number, y: number) => {
    const { project } = this.props
    const { rotation, hover, placement } = this.state
    const projectParcels = getParcelOrientation(project!.layout, hover, rotation)

    if (!hover || placement) return false
    return projectParcels.some(parcel => parcel.x === x && parcel.y === y)
  }

  isPlaced = (x: number, y: number) => {
    const { project } = this.props
    const { placement } = this.state

    if (!placement) return null

    const projectParcels = getParcelOrientation(project!.layout, placement.point, placement.rotation)
    return projectParcels.some(parcel => parcel.x === x && parcel.y === y)
  }

  strokeLayer: Layer = (x: number, y: number) => {
    const placed = this.isPlaced(x, y)
    if (this.isHighlighted(x, y) || placed) {
      return {
        color: this.isValid() || placed ? COLORS.selectedStroke : COLORS.indicatorStroke,
        scale: 1.5
      }
    }
    return null
  }

  highlightLayer: Layer = (x: number, y: number) => {
    const placed = this.isPlaced(x, y)
    if (this.isHighlighted(x, y) || placed) {
      return { color: this.isValid() || placed ? COLORS.selected : COLORS.indicator, scale: 1.2 }
    }
    return null
  }

  handleHover = (x: number, y: number) => {
    this.setState({
      hover: { x, y }
    })
  }

  handlePlacement = (x: number, y: number) => {
    if (!this.isValid()) return

    this.setState({
      placement: { point: { x, y }, rotation: this.state.rotation }
    })
  }

  handleSelectPlacement = () => {
    const { placement } = this.state
    const { onConfirmPlacement } = this.props
    const overlappedDeployment = this.getOverlappedDeployemnt()
    if (placement) {
      overlappedDeployment ? onConfirmPlacement(placement, overlappedDeployment.id) : onConfirmPlacement(placement)
    }
  }

  handleRotate = (direction: 1 | -1) => () => {
    const { rotation, placement } = this.state
    if (placement) return
    const newRotation =
      (((ROTATION_ORDER.indexOf(rotation) + direction) % ROTATION_ORDER.length) + ROTATION_ORDER.length) % ROTATION_ORDER.length

    this.analytics.track('Publish to LAND atlas rotate', { direction })

    this.setState({ rotation: ROTATION_ORDER[newRotation] })
  }

  handleLocateLand = () => {
    const { landTiles } = this.props
    const { currentLandId } = this.state
    const nextLand = locateNextLand(landTiles, currentLandId || '')

    this.analytics.track('Publish to LAND atlas locate')

    this.setState({
      currentLandId: nextLand.id
    })
  }

  handleResetPlacement = () => {
    this.setState({
      placement: null
    })
  }

  handleNoAuthorizedParcels = () => {
    this.props.onNoAuthorizedParcels()
  }

  truncateTitle(input: string, max: number = 10) {
    if (input.length > max) {
      return input.substring(0, max) + '...'
    }
    return input
  }

  getOverlappedDeployemnt = () => {
    const { deploymentsByCoord, project } = this.props
    const { placement } = this.state
    if (project && placement) {
      const parcels = getParcelOrientation(project.layout, placement.point, placement.rotation)
      for (const parcel of parcels) {
        const deploymentInCoord = deploymentsByCoord[coordsToId(parcel.x, parcel.y)]
        if (deploymentInCoord) {
          return deploymentInCoord
        }
      }
    }
    return null
  }

  renderTool = (icon: IconName, tooltip: string, clickHandler: () => void) => {
    return (
      <Popup
        className="modal-tooltip"
        content={tooltip}
        position="top center"
        trigger={
          <div className={`tool ${icon}`} onClick={clickHandler}>
            <Icon name={icon} />
          </div>
        }
        on="hover"
        inverted
      />
    )
  }

  render() {
    const { media, project, landTiles, deployment } = this.props
    const { placement, rotation, zoom, currentLandId } = this.state
    const hasPlacement = !!placement
    const parcelCount = Object.keys(landTiles).length
    const [targetX, targetY] = currentLandId ? idToCoords(currentLandId) : [0, 0]
    const target: Coordinate = { x: targetX, y: targetY }
    const overlappedDeployment = this.getOverlappedDeployemnt()
    const conflictingDeployment =
      overlappedDeployment &&
      deployment &&
      overlappedDeployment.projectId &&
      deployment.projectId &&
      overlappedDeployment.projectId !== deployment.projectId
        ? overlappedDeployment
        : null
    const { rows, cols } = project.layout

    return (
      <div className="LandAtlas">
        {parcelCount === 0 && (
          <div className="notice">
            {t('deployment_modal.land.map.no_land_warning')}
            <span className="inline-action" onClick={this.handleNoAuthorizedParcels}>
              {t('deployment_modal.land.map.no_land_action')}
            </span>
          </div>
        )}
        {conflictingDeployment && (
          <div className="notice">
            <DCLIcon name="warning sign" />
            {t('deployment_modal.land.map.occupied_warning', { name: conflictingDeployment.name })}
          </div>
        )}
        {parcelCount !== 0 && (
          <div className={'thumbnail' + (hasPlacement ? ' disable-rotate' : '')}>
            <img src={media ? media[rotation] : ''} />
            <div className="rotate anticlockwise" onClick={this.handleRotate(ANTICLOCKWISE_ROTATION)}>
              <Icon name="rotate-left" />
            </div>
            <div className="rotate clockwise" onClick={this.handleRotate(CLOCKWISE_ROTATION)}>
              <Icon name="rotate-right" />
            </div>
          </div>
        )}
        <div className="atlas-container">
          <Atlas
            showControls
            onLocateLand={this.handleLocateLand}
            layers={[this.strokeLayer, this.highlightLayer]}
            onHover={this.handleHover}
            onClick={this.handlePlacement}
            zoom={zoom}
            x={target.x}
            y={target.y}
          />
        </div>
        <div className="actions">
          <div className="summary">
            {hasPlacement ? (
              <span>
                <T
                  id="deployment_modal.land.map.placement_active"
                  values={{
                    count: rows * cols,
                    x: placement!.point.x,
                    y: placement!.point.y
                  }}
                />
                <span className="inline-action" onClick={this.handleResetPlacement}>
                  Reset
                </span>
              </span>
            ) : (
              t('deployment_modal.land.map.placement_default')
            )}
          </div>
          <Popup
            className="publish-disabled modal-tooltip"
            content={
              <span>
                <T
                  id="deployment_modal.land.map.occupied_tooltip"
                  values={{ name: conflictingDeployment ? conflictingDeployment.name : '', br: <br /> }}
                />
              </span>
            }
            position="top center"
            disabled
            trigger={
              <span>
                <Button primary size="small" disabled={!hasPlacement} onClick={this.handleSelectPlacement}>
                  {t('deployment_modal.land.map.continue')}
                </Button>
              </span>
            }
            on="hover"
            inverted
          />
        </div>
      </div>
    )
  }
}
