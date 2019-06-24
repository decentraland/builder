import * as React from 'react'
import { Button, Loader, Atlas, Header, Layer } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import './DeployToLand.css'

import { Props, State } from './DeployToLand.types'
import { api } from 'lib/api'

export default class DeployToLand extends React.PureComponent<Props, State> {
  state: State = {
    placement: null,
    hasError: false,
    parcels: {}
  }

  componentWillReceiveProps(nextProps: Props) {
    debugger
    if (Object.keys(this.state.parcels).length === 0 && nextProps.ethAddress) {
      this.fetchAuthorizedParcels()
    }
  }

  fetchAuthorizedParcels = async () => {
    const { ethAddress } = this.props
    debugger
    if (ethAddress) {
      const res = await api.fetchAuthorizedParcels(ethAddress)
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

  authorizedLayer: Layer = (x: number, y: number) => {
    const { parcels } = this.state
    if (parcels[x + ',' + y]) {
      return { color: '#00d3ff' }
    }
    return null
  }

  handleConnect = () => {
    this.props.onConnect!()
    this.props.onRecord()
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
    return <>progress</>
  }

  renderMap = () => {
    const { media } = this.props
    return (
      <div className="DeployToLand atlas">
        <img className="thumbnail" src={media ? media.north : ''} />
        <div className="atlas-container">
          <Atlas layers={[this.authorizedLayer]} />
        </div>
      </div>
    )
  }

  renderConfirmation = () => {
    return <>condirmation</>
  }

  render() {
    const { isConnected, isRecording, isUploadingAssets, media } = this.props
    const { placement } = this.state

    if (!isConnected) return this.renderConnectForm()

    if (isConnected && (isRecording || isUploadingAssets)) return this.renderProgress()

    if (isConnected && media && !placement) return this.renderMap()

    if (isConnected && media && placement && !isUploadingAssets) return this.renderConfirmation()

    return <Loader size="big" />
  }
}
