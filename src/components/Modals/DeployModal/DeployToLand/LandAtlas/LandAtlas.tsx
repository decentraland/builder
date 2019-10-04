import * as React from 'react'

import { Layer, Button, Atlas, Popup, Loader } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import Icon from 'components/Icon'
import { IconName } from 'components/Icon/Icon.types'
import { Rotation, Coordinate } from 'modules/deployment/types'
import { getParcelOrientation } from 'modules/project/utils'
import { Coord, marketplace } from 'lib/api/marketplace'

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

  mounted: boolean = true

  analytics = getAnalytics()

  componentDidMount() {
    this.mounted = true
    const { isLoggedIn, onFetchDeployments } = this.props
    if (isLoggedIn) {
      onFetchDeployments()
    }
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
      const [authorizedParcels, authorizedEstates] = await Promise.all([
        marketplace.fetchAuthorizedParcels(ethAddress),
        marketplace.fetchAuthorizedEstates(ethAddress)
      ])

      if (this.mounted) {
        const parcels: Record<string, Coord> = {}

        authorizedParcels.reduce((parcels, parcel) => {
          parcels[parcel.id] = {
            x: parcel.x,
            y: parcel.y
          }
          return parcels
        }, parcels)

        authorizedEstates.reduce((parcels, estate) => {
          for (const parcel of estate.data.parcels) {
            const id = `${parcel.x},${parcel.y}`
            parcels[id] = {
              x: parcel.x,
              y: parcel.y
            }
          }
          return parcels
        }, parcels)

        this.analytics.track('LAND authorized for publish', { count: authorizedParcels.length })

        let newTarget = landTarget

        if (landTarget === '0,0') {
          // Only point to the first authorized parcel if no initialPoint was provided
          if (authorizedParcels.length) {
            newTarget = authorizedParcels[0].id
          } else if (authorizedEstates.length) {
            const estate = authorizedEstates.find(estate => !!estate.data.parcels.length)
            if (estate) {
              const land = estate.data.parcels[0]
              newTarget = `${land.x},${land.y}`
            }
          }
        }

        this.setState({
          parcels,
          landTarget: newTarget,
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
        color: this.isValid() || placed ? COLORS.selectedStroke : COLORS.indicatorStroke,
        scale: 1.5
      }
    }
    return null
  }

  authorizedLayer: Layer = (x: number, y: number) => {
    const { occupiedParcels } = this.props
    const { parcels } = this.state

    if (occupiedParcels[x + ',' + y]) {
      return { color: COLORS.occupiedParcel, scale: 1 }
    } else if (parcels[x + ',' + y]) {
      return { color: COLORS.freeParcel, scale: 1 }
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
    if (placement) {
      onConfirmPlacement(placement)
    }
  }

  handleRotate = (direction: 1 | -1) => () => {
    const { rotation, placement } = this.state
    if (placement) return
    const newRotation =
      ((ROTATION_ORDER.indexOf(rotation) + direction) % ROTATION_ORDER.length + ROTATION_ORDER.length) % ROTATION_ORDER.length

    this.analytics.track('Publish to LAND atlas rotate', { direction })

    this.setState({ rotation: ROTATION_ORDER[newRotation] })
  }

  handleLocateLand = () => {
    const { landTarget, parcels } = this.state
    const parcelKeys = Object.keys(parcels)
    const index = landTarget ? parcelKeys.indexOf(landTarget) : 0
    const nextIndex = ((index + 1) % parcelKeys.length + parcelKeys.length) % parcelKeys.length

    this.analytics.track('Publish to LAND atlas locate')

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
    const hasPlacement = !!placement
    const parcelCount = Object.keys(parcels).length
    const target: Coordinate = landTarget && parcelCount ? parcels[landTarget] : { x: 0, y: 0 }
    const hasOccupiedParcels = this.hasOccupiedParcels()
    const { rows, cols } = project.layout

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
