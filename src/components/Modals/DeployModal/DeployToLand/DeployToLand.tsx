import * as React from 'react'
import { Button, Loader } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import './DeployToLand.css'

import { Props, State } from './DeployToLand.types'

export default class DeployToLand extends React.PureComponent<Props, State> {
  handleConnect = () => {
    this.props.onConnect!()
  }

  renderConnectForm = () => {
    const { hasError, isConnecting } = this.props
    let errorClasses = 'error'

    if (hasError) {
      errorClasses += ' visible'
    }

    return (
      <div className="DeployToLand">
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
    return <>map</>
  }

  renderConfirmation = () => {
    return <>condirmation</>
  }

  render() {
    const { isConnected, isRecording, isUploadingAssets, images } = this.props
    const { placement } = this.state

    if (!isConnected) return this.renderConnectForm()

    if (isConnected && (isRecording || isUploadingAssets)) return this.renderProgress()

    if (isConnected && images && !placement) return this.renderMap()

    if (isConnected && images && placement && !isUploadingAssets) return this.renderConfirmation()

    return <Loader size="big" />
  }
}
