import * as React from 'react'
import { api } from 'lib/api'
import { Button, Loader, Atlas, Header, Layer } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import { Coordinate, Rotation } from 'modules/project/types'
import { getParcelOrientation } from 'modules/project/utils'
import { Props, State } from './DeployToLand.types'
import './DeployToLand.css'

const ROTATION_ORDER: Rotation[] = ['north', 'east', 'south', 'west']

export default class DeployToLand extends React.PureComponent<Props, State> {
  state: State = {
    placement: null,
    hasError: false,
    parcels: {},
    hover: { x: 0, y: 0 },
    rotation: 'north',
    needsConfirmation: false
  }

  hover: Coordinate = { x: 0, y: 0 }

  mounted: boolean = true

  componentDidMount() {
    this.mounted = true
    this.props.onRecord()
  }

  componentWillReceiveProps(nextProps: Props) {
    if (Object.keys(this.state.parcels).length === 0 && nextProps.ethAddress) {
      this.fetchAuthorizedParcels(nextProps.ethAddress)
    }
  }

  componentWillUnmount() {
    this.mounted = false
  }

  fetchAuthorizedParcels = async (ethAddress: string) => {
    const res = await api.fetchAuthorizedParcels(ethAddress)
    if (this.mounted) {
      this.setState({
        parcels: res.parcels.reduce(
          (parcels: any, parcel: any) => ({
            ...parcels,
            [parcel.id]: {
              x: parcel.x,
              y: parcel.y
            }
          }),
          {}
        )
      })
    }
  }

  isValid = () => {
    const { hover } = this
    const { project } = this.props
    const { rotation, parcels } = this.state
    const projectParcels = getParcelOrientation(project!, hover, rotation)

    if (!hover) return false

    return projectParcels.every(({ x, y }) => !!parcels[`${x},${y}`])
  }

  isHighlighted = (x: number, y: number) => {
    const { hover } = this
    const { project } = this.props
    const { rotation } = this.state
    const projectParcels = getParcelOrientation(project!, hover, rotation)

    if (!hover) return false
    return projectParcels.some(parcel => parcel.x === x && parcel.y === y)
  }

  isPlaced = (x: number, y: number) => {
    const { project } = this.props
    const { placement } = this.state

    if (!placement) return null

    const projectParcels = getParcelOrientation(project!, placement.point, placement.rotation)
    return projectParcels.some(parcel => parcel.x === x && parcel.y === y)
  }

  authorizedLayer: Layer = (x: number, y: number) => {
    const { parcels } = this.state

    if (parcels[x + ',' + y]) {
      return { color: this.isPlaced(x, y) ? '#ff4053' : '#00d3ff' }
    }
    return null
  }

  hoverStrokeLayer: Layer = (x: number, y: number) => {
    if (this.isHighlighted(x, y)) {
      return {
        color: this.isValid() ? '#44ff00' : '#ff0044',
        scale: 1.5
      }
    }
    return null
  }

  hoverFillLayer: Layer = (x: number, y: number) => {
    if (this.isHighlighted(x, y)) {
      return {
        color: this.isValid() ? '#99ff90' : '#ff9990',
        scale: 1.2
      }
    }
    return null
  }

  handleHover = (x: number, y: number) => {
    this.hover.x = x
    this.hover.y = y
  }

  handlePlacement = (x: number, y: number) => {
    if (!this.isValid()) return

    this.setState({
      placement: { point: { x, y }, rotation: this.state.rotation }
    })
  }

  handleSelectPlacement = () => {
    this.setState({ needsConfirmation: true })
  }

  handleDeploy = () => {
    const { placement } = this.state

    if (placement) {
      const { point, rotation } = placement
      this.setState({ needsConfirmation: true })
      this.props.onDeploy(this.props.ethAddress!, point, rotation)
    }
  }

  handleConnect = () => {
    this.props.onConnect!()
  }

  handleRotateAntiClockwise = () => {
    const { rotation } = this.state
    const newRotation = (((ROTATION_ORDER.indexOf(rotation) - 1) % ROTATION_ORDER.length) + ROTATION_ORDER.length) % ROTATION_ORDER.length
    this.setState({ rotation: ROTATION_ORDER[newRotation] })
  }

  handleRotateClockwise = () => {
    const { rotation } = this.state
    const newRotation = (((ROTATION_ORDER.indexOf(rotation) + 1) % ROTATION_ORDER.length) + ROTATION_ORDER.length) % ROTATION_ORDER.length
    this.setState({ rotation: ROTATION_ORDER[newRotation] })
  }

  renderConnectForm = () => {
    const { hasError, isConnecting } = this.props
    let errorClasses = 'error'

    if (hasError) {
      errorClasses += ' visible'
    }

    return (
      <div className="DeployToLand">
        <Header size="large" className="modal-title">
          Publish your scene
        </Header>
        <p className="modal-subtitle">Connect your wallet to continue. You sure have one if you own LAND.</p>

        <Button className="connect" primary onClick={this.handleConnect} disabled={isConnecting}>
          {isConnecting ? <T id="@dapps.sign_in.connecting" /> : <T id="@dapps.sign_in.connect" />}
        </Button>

        <p className={errorClasses}>
          <T id="@dapps.sign_in.error" />
        </p>
      </div>
    )
  }

  renderProgress = () => {
    const { mediaProgress } = this.props

    let classes = 'progress-bar'

    if (mediaProgress === 100) {
      classes += ' active'
    }

    return (
      <div className="DeployToLand progress">
        <Header size="large" className="modal-title">
          Capturing Preview
        </Header>
        <p className="modal-subtitle">Please wait while a preview of your project is captured.</p>

        <div className="progress-bar-container">
          <div className={classes} style={{ width: `${mediaProgress}%` }} />
        </div>
      </div>
    )
  }

  renderMap = () => {
    const { media, project } = this.props
    const { placement, rotation } = this.state

    const hasPlacement = !!placement && !!project && !!project.parcels

    return (
      <div className="DeployToLand atlas">
        <div className="thumbnail">
          <img src={media ? media[rotation] : ''} />
          <div className="rotate anticlockwise" onClick={this.handleRotateAntiClockwise} />
          <div className="rotate clockwise" onClick={this.handleRotateClockwise} />
        </div>
        <div className="atlas-container">
          <Atlas
            layers={[this.authorizedLayer, this.hoverStrokeLayer, this.hoverFillLayer]}
            onHover={this.handleHover}
            onClick={this.handlePlacement}
          />
        </div>
        <div className="actions">
          <div className="summary">
            {hasPlacement
              ? `Placing a ${project!.parcels!.length} LAND scene at ${placement!.point.x},${placement!.point.y}`
              : 'Choose a parcel where to place your scene'}
          </div>
          <Button primary size="small" disabled={!hasPlacement} onClick={this.handleSelectPlacement}>
            Continue
          </Button>
        </div>
      </div>
    )
  }

  renderConfirmation = () => {
    const { media, project } = this.props
    const { placement } = this.state

    return (
      <div className="DeployToLand confirmation">
        <Header size="large" className="modal-title">
          Publish Scene
        </Header>
        <p className="modal-subtitle">You are about to publish the following scene to the Metaverse:</p>

        <div className="details">
          <img src={media ? media.thumbnail : ''} />

          <div className="details-row">
            <div className="detail">
              <span className="label">Scene</span>
              <span className="value">{project!.title}</span>
            </div>

            <div className="detail">
              <span className="label">Size</span>
              <span className="value">{project!.parcels!.length}</span>
            </div>

            <div className="detail">
              <span className="label">Base</span>
              <span className="value">{`${placement!.point.x}, ${placement!.point.y}`}</span>
            </div>
          </div>
        </div>

        <Button primary size="small" onClick={this.handleDeploy}>
          Publish
        </Button>
      </div>
    )
  }

  render() {
    const { isConnected, isRecording, isUploadingAssets, media } = this.props
    const { needsConfirmation } = this.state

    if (!isConnected) return this.renderConnectForm()

    if (isConnected && (isRecording || isUploadingAssets)) return this.renderProgress()

    if (isConnected && media && !needsConfirmation) return this.renderMap()

    if (isConnected && media && !isUploadingAssets && needsConfirmation) return this.renderConfirmation()

    return <Loader size="big" />
  }
}
