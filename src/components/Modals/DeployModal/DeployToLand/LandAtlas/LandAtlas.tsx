import * as React from 'react'
import { api } from 'lib/api'
import { Layer, Button, Atlas, Popup, Loader } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import Icon from 'components/Icon'
import { IconName } from 'components/Icon/Icon.types'
import { Rotation, Coordinate } from 'modules/deployment/types'
import { getParcelOrientation } from 'modules/project/utils'

import { Props, State } from './LandAtlas.types'
import './LandAtlas.css'

const ROTATION_ORDER: Rotation[] = ['north', 'east', 'south', 'west']
const CLOCKWISE_ROTATION = 1
const ANTICLOCKWISE_ROTATION = -1
const analytics = getAnalytics()

export default class LandAtlas extends React.PureComponent<Props, State> {
  state: State = this.getBaseState()

  mounted: boolean = true

  componentDidMount() {
    this.mounted = true
    if (Object.keys(this.state.parcels).length === 0 && this.props.ethAddress) {
      // tslint:disable-next-line
      this.fetchAuthorizedParcels(this.props.ethAddress)
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (Object.keys(this.state.parcels).length === 0 && nextProps.ethAddress) {
      // tslint:disable-next-line
      this.fetchAuthorizedParcels(nextProps.ethAddress)
    }
  }

  componentWillUnmount() {
    this.mounted = false
  }

  getBaseState(): State {
    const { initialPoint } = this.props
    return {
      placement: null,
      hover: { x: 0, y: 0 },
      parcels: {},
      rotation: 'north',
      zoom: 1,
      landTarget: initialPoint ? `${initialPoint.x},${initialPoint.y}` : '0,0',
      isLoadingMap: true
    }
  }

  fetchAuthorizedParcels = async (ethAddress: string) => {
    const { landTarget } = this.state

    try {
      const res = await api.fetchAuthorizedParcels(ethAddress)
      if (this.mounted) {
        const parcels = res.parcels.reduce(
          (parcels: any, parcel: any) => ({
            ...parcels,
            [parcel.id]: {
              x: parcel.x,
              y: parcel.y
            }
          }),
          {}
        )

        analytics.track('LAND authorized for publish', { count: res.parcels.length })

        this.setState({
          parcels,
          // Only point to the first authorized parcel if no initialPoint was provided
          landTarget: landTarget === '0,0' && res.parcels.length ? res.parcels[0].id : landTarget,
          isLoadingMap: false
        })
      }
    } catch (e) {
      console.error('Unable to fetch authorized LANDs', e)
    }
  }

  isValid = () => {
    const { project } = this.props
    const { rotation, parcels, hover } = this.state
    const projectParcels = getParcelOrientation(project!, hover, rotation)

    if (!hover) return false

    return projectParcels.every(({ x, y }) => !!parcels[`${x},${y}`])
  }

  isHighlighted = (x: number, y: number) => {
    const { project } = this.props
    const { rotation, hover, placement } = this.state
    const projectParcels = getParcelOrientation(project!, hover, rotation)

    if (!hover || placement) return false
    return projectParcels.some(parcel => parcel.x === x && parcel.y === y)
  }

  isPlaced = (x: number, y: number) => {
    const { project } = this.props
    const { placement } = this.state

    if (!placement) return null

    const projectParcels = getParcelOrientation(project!, placement.point, placement.rotation)
    return projectParcels.some(parcel => parcel.x === x && parcel.y === y)
  }

  strokeLayer: Layer = (x: number, y: number) => {
    const placed = this.isPlaced(x, y)
    if (this.isHighlighted(x, y) || placed) {
      return {
        color: this.isValid() || placed ? '#ff0044' : '#3a3541',
        scale: 1.5
      }
    }
    return null
  }

  authorizedLayer: Layer = (x: number, y: number) => {
    const { occupiedParcels } = this.props
    const { parcels } = this.state

    if (occupiedParcels[x + ',' + y]) {
      return { color: '#965853', scale: 1 }
    } else if (parcels[x + ',' + y]) {
      return { color: '#00d3ff', scale: 1 }
    }

    return null
  }

  highlightLayer: Layer = (x: number, y: number) => {
    const placed = this.isPlaced(x, y)
    if (this.isHighlighted(x, y) || placed) {
      return { color: this.isValid() || placed ? '#ff9990' : '#716b7a', scale: 1.2 }
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
    if (placement) {
      onConfirmPlacement(placement)
    }
  }

  handleRotate = (direction: 1 | -1) => () => {
    const { rotation, placement } = this.state
    if (placement) return
    const newRotation =
      (((ROTATION_ORDER.indexOf(rotation) + direction) % ROTATION_ORDER.length) + ROTATION_ORDER.length) % ROTATION_ORDER.length

    analytics.track('Publish to LAND atlas rotate', { direction })

    this.setState({ rotation: ROTATION_ORDER[newRotation] })
  }

  handleLocateLand = () => {
    const { landTarget, parcels } = this.state
    const parcelKeys = Object.keys(parcels)
    const index = landTarget ? parcelKeys.indexOf(landTarget) : 0
    const nextIndex = (((index + 1) % parcelKeys.length) + parcelKeys.length) % parcelKeys.length

    analytics.track('Publish to LAND atlas locate')

    this.setState({
      landTarget: parcelKeys[nextIndex]
    })
  }

  handleZoomIn = () => {
    this.setState({
      zoom: this.state.zoom + 0.5
    })
  }

  handleZoomOut = () => {
    this.setState({
      zoom: this.state.zoom - 0.5
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

  hasOccupiedParcels = () => {
    const { occupiedParcels, project } = this.props
    const { placement } = this.state
    if (project && placement) {
      const projectParcels = getParcelOrientation(project, placement.point, placement.rotation)
      return projectParcels.some(parcel => !!occupiedParcels[`${parcel.x},${parcel.y}`])
    }
    return false
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
    const { media, project } = this.props
    const { placement, rotation, zoom, landTarget, parcels, isLoadingMap } = this.state
    const hasPlacement = !!placement && !!project && !!project.parcels
    const parcelCount = Object.keys(parcels).length
    const target: Coordinate = landTarget && parcelCount ? parcels[landTarget] : { x: 0, y: 0 }
    const hasOccupiedParcels = this.hasOccupiedParcels()

    if (isLoadingMap) {
      return (
        <div className="LandAtlas">
          <Loader size="big" />
        </div>
      )
    }

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
        {hasOccupiedParcels && <div className="notice">{t('deployment_modal.land.map.occupied_warning')}</div>}
        <div className={'thumbnail' + (hasPlacement ? ' disable-rotate' : '')}>
          <img src={media ? media[rotation] : ''} />
          <div className="rotate anticlockwise" onClick={this.handleRotate(ANTICLOCKWISE_ROTATION)}>
            <Icon name="rotate-left" />
          </div>
          <div className="rotate clockwise" onClick={this.handleRotate(CLOCKWISE_ROTATION)}>
            <Icon name="rotate-right" />
          </div>
        </div>
        <div className="atlas-container">
          <div className="tool-container">
            {this.renderTool('locate-land', t('deployment_modal.land.map.locate_land'), this.handleLocateLand)}
            <div className="tool-group">
              {this.renderTool('atlas-zoom-out', t('deployment_modal.land.map.zoom_out'), this.handleZoomOut)}
              {this.renderTool('atlas-zoom-in', t('deployment_modal.land.map.zoom_in'), this.handleZoomIn)}
            </div>
          </div>

          <Atlas
            layers={[this.authorizedLayer, this.strokeLayer, this.highlightLayer]}
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
                    count: project!.parcels!.length,
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
                <T id="deployment_modal.land.map.occupied_tooltip" values={{ br: <br /> }} />
              </span>
            }
            position="top center"
            disabled={!hasOccupiedParcels}
            trigger={
              <span>
                <Button primary size="small" disabled={!hasPlacement || hasOccupiedParcels} onClick={this.handleSelectPlacement}>
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
